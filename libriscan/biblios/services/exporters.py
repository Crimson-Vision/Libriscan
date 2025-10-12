import io
import logging
from decimal import Decimal
from pymupdf import Document as PdfDocument, Point

from django.http import FileResponse, HttpResponseBadRequest

from biblios.models import Document, TextBlock

logger = logging.getLogger(__name__)


def export_text(doc):
    """
    Returns a text file of this document.
    """
    logger.info(f"Generating a text file of {doc}")
    if not isinstance(doc, Document):
        logger.error(f"export_text() called with object of {type(doc)} type.")
        return HttpResponseBadRequest("Invalid document")

    # Lines will be tracked by comparing each word's horizontal position on the page to the previous.
    # If a word is suddenly to the left of the previous one's right-most corner, it's a new line.
    # Don't use vertical position though -- too many false positives from variation in the exact Y positions
    lines = []
    words = []
    current_line = 0

    # Create a buffer that can be returned as a file download
    output = io.BytesIO()

    for page in doc.pages.all():
        for word in page.words.filter(print_control=TextBlock.INCLUDE):
            # Compare the word's line number to the last one, and start a new line if appropriate
            if word.line > current_line:
                lines.append(f"{' '.join(words)}\n")
                words = []

            current_line = word.line
            words.append(word.text)
        lines.append(f"{' '.join(words)}\n")
        words = []

    # Write the text to the buffer and send it as a file response
    output.write(bytes("".join(lines), "utf-8"))
    output.seek(0)
    return FileResponse(output, as_attachment=True, filename=f"{doc.identifier}.txt")


def export_pdf(doc, use_image=True):
    """
    Returns a PDF version of this document with the images and text of all its pages.

    doc: a Document object
    use_image: whether to generate the PDF with the doc's page images or just render the text
    """
    logger.info(f"Generating a PDF of {doc}")
    if not isinstance(doc, Document):
        logger.error(f"export_pdf() called with object of {type(doc)} type.")
        return HttpResponseBadRequest("Invalid document")

    new_pdf = PdfDocument()

    # use PDF render mode 3 ("not rendered") if we're generating a PDF from the page images
    # https://pymupdf.readthedocs.io/en/latest/shape.html
    render_mode = 3 if use_image else 0

    for page in doc.pages.order_by("number"):
        # skip pages that don't have an image yet (even if we're not printing them)
        if not page.image:
            pass
        height = page.image.height
        width = page.image.width

        new_pdf.new_page(-1, width=width, height=height)
        if use_image:
            new_pdf[-1].insert_image(
                rect=(0, 0, width, height), filename=page.image.path
            )

        for word in page.words.filter(print_control=TextBlock.INCLUDE):
            # TextBlock coordinates are percentages of page size, so convert them to real pixels
            # x0, y0 is top left, x1, y1 is bottom right.
            x0 = word.geo_x_0 * width
            y0 = word.geo_y_0 * height
            x1 = word.geo_x_1 * width
            # y1 = word.geo_y_1 * height //unused

            # Use a font size that will fill the height of the text block.
            # Courier characters are about 0.6x as wide as they are tall, so divide the width of the word in pts by
            # the number of characters in it and multiple by 1.67 to get the font size
            size = int(((x1 - x0) / len(word.text)) * Decimal(1.67))

            # Text will be placed relative to the bottom-left point of its geometry.
            # Don't use y1 for this -- y1 is too low when there are descenders like g or q.
            # Instead, use the font size as an offset to y0.
            point = Point(x0, y0 + size)

            # Courier font so we can calculate size more easily, italicized if it's handwriting.
            # Font choices are shown here: https://pymupdf.readthedocs.io/en/latest/recipes-text.html
            # Hopefully they don't change these strings
            font = "coit" if word.text_type is TextBlock.HANDWRITING else "cour"

            # Add the word to the page
            new_pdf[-1].insert_text(
                point=point,
                text=word.text,
                fontsize=size,
                fontname=font,
                render_mode=render_mode,
            )

    # Save the new PDF to a buffer that can be returned as a file download
    output = io.BytesIO()
    new_pdf.save(output)
    output.seek(0)
    return FileResponse(output, as_attachment=True, filename=f"{doc.identifier}.pdf")
