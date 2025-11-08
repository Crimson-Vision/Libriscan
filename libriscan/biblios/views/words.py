import logging

from django.db import transaction
from django.http import JsonResponse
from django.core.exceptions import ObjectDoesNotExist
from django.views.decorators.http import require_http_methods
from django.shortcuts import get_object_or_404, render


from rules.contrib.views import permission_required

from biblios.models import TextBlock
from .base import get_org_by_word

logger = logging.getLogger("django")


@permission_required(
    "biblios.change_textblock", fn=get_org_by_word, raise_exception=True
)
@require_http_methods(["POST"])
def update_word(request, short_name, collection_slug, identifier, number, word_id):
    """Update a TextBlock's text and set confidence to 99.999"""
    try:
        # Get the word with proper permissions check
        word = get_object_or_404(
            TextBlock,
            id=word_id,
            page__number=number,
            page__document__identifier=identifier,
            page__document__collection__slug=collection_slug,
            page__document__collection__owner__short_name=short_name,
        )

        # Update the word text and confidence
        new_text = request.POST.get("text", "").strip()
        if new_text:
            word.text = new_text
            word.confidence = TextBlock.CONF_ACCEPTED
            word.save(update_fields=["text", "confidence"])

            return JsonResponse(
                {
                    "id": word.id,
                    "text": word.text,
                    "confidence": float(word.confidence),
                    "confidence_level": word.confidence_level,
                    "suggestions": dict(word.suggestions)
                    if isinstance(word.suggestions, list)
                    else word.suggestions,
                }
            )
        else:
            return JsonResponse({"error": "Text cannot be empty"}, status=400)

    except Exception as e:
        logger.error(f"Error updating word {word_id}: {e}")
        return JsonResponse({"error": "Failed to update word"}, status=500)


@permission_required(
    "biblios.change_textblock", fn=get_org_by_word, raise_exception=True
)
@require_http_methods(["POST", "PATCH"])
def update_print_control(
    request, short_name, collection_slug, identifier, number, word_id
):
    """Update a TextBlock's print_control field"""
    try:
        # Get the word with proper permissions check
        word = get_object_or_404(
            TextBlock,
            id=word_id,
            page__number=number,
            page__document__identifier=identifier,
            page__document__collection__slug=collection_slug,
            page__document__collection__owner__short_name=short_name,
        )

        # Get the new print_control value
        print_control = request.POST.get("print_control", "").strip()

        # Validate against allowed choices
        valid_choices = [
            choice[0] for choice in TextBlock.PRINT_CONTROL_CHOICES.items()
        ]
        if print_control not in valid_choices:
            return JsonResponse(
                {
                    "error": f"Invalid print_control value. Must be one of: {', '.join(valid_choices)}"
                },
                status=400,
            )

        # Update the print_control field
        word.print_control = print_control
        word.save(update_fields=["print_control"])

        logger.info(f"Updated word {word_id} print_control to {print_control}")

        return JsonResponse(
            {
                "id": word.id,
                "text": word.text,
                "print_control": word.print_control,
                "print_control_display": TextBlock.PRINT_CONTROL_CHOICES.get(
                    word.print_control
                ),
                "confidence": float(word.confidence),
                "confidence_level": word.confidence_level,
            }
        )

    except Exception as e:
        logger.error(f"Error updating print_control for word {word_id}: {e}")
        return JsonResponse({"error": "Failed to update print_control"}, status=500)


@permission_required(
    "biblios.change_textblock", fn=get_org_by_word, raise_exception=True
)
@require_http_methods(["POST", "PATCH"])
def toggle_review_flag(
    request, short_name, collection_slug, identifier, number, word_id
):
    """Toggle a TextBlock's review flag"""
    try:
        word = get_object_or_404(
            TextBlock,
            id=word_id,
            page__number=number,
            page__document__identifier=identifier,
            page__document__collection__slug=collection_slug,
            page__document__collection__owner__short_name=short_name,
        )
        word.review = not word.review
        word.save(update_fields=["review"])
        
        # Count flagged words on the page
        flagged_count = word.page.words.filter(review=True).count()
        
        # Return HTML partial for HTMX swap
        context = {
            "word": word,
            "short_name": short_name,
            "collection_slug": collection_slug,
            "identifier": identifier,
            "number": number,
            "flagged_count": flagged_count,
        }
        return render(request, "biblios/components/forms/review_flag_button.html", context)
    except Exception as e:
        logger.error(f"Error toggling review flag for word {word_id}: {e}")
        return JsonResponse({"error": "Failed to toggle review flag"}, status=500)


@permission_required("biblios.view_textblock", fn=get_org_by_word, raise_exception=True)
@require_http_methods(["GET"])
def textblock_history(
    request, short_name, collection_slug, identifier, number, word_id
):
    """Return the audit history of a specific TextBlock"""
    try:
        # Get the word with proper permissions check
        word = get_object_or_404(
            TextBlock,
            id=word_id,
            page__number=number,
            page__document__identifier=identifier,
            page__document__collection__slug=collection_slug,
            page__document__collection__owner__short_name=short_name,
        )

        # Get all historical records for this TextBlock
        history_records = word.history.all()

        # Build response data
        history_data = []
        for record in history_records:
            # Get user role information
            user_role = None
            if record.history_user:
                # Get the user's primary role (first role found)
                role_obj = record.history_user.userrole_set.first()
                if role_obj:
                    user_role = role_obj.get_role_display()

            history_data.append(
                {
                    "history_id": record.history_id,
                    "history_date": record.history_date.isoformat(),
                    "history_type": record.get_history_type_display(),
                    "history_change_reason": record.history_change_reason,
                    "history_user": record.history_user.get_full_name()
                    or record.history_user.email
                    if record.history_user
                    else "Unknown User",
                    "history_user_role": user_role,
                    "text": record.text,
                    "confidence": float(record.confidence),
                    "text_type": record.text_type,
                    "text_type_display": TextBlock.TEXT_TYPE_CHOICES.get(
                        record.text_type
                    ),
                    "print_control": record.print_control,
                    "print_control_display": TextBlock.PRINT_CONTROL_CHOICES.get(
                        record.print_control
                    ),
                    "line": record.line,
                    "number": record.number,
                }
            )

        logger.info(f"Retrieved {len(history_data)} history records for word {word_id}")

        return JsonResponse(
            {
                "word_id": word_id,
                "current_text": word.text,
                "history_count": len(history_data),
                "history": history_data,
            }
        )

    except Exception as e:
        logger.error(f"Error retrieving history for word {word_id}: {e}")
        return JsonResponse({"error": "Failed to retrieve history"}, status=500)


@permission_required(
    "biblios.change_textblock", fn=get_org_by_word, raise_exception=True
)
@require_http_methods(["POST"])
def revert_word(request, short_name, collection_slug, identifier, number, word_id):
    """Revert a word to its original value."""
    try:
        response = {}
        status = 400
        # Get the word with proper permissions check
        word = get_object_or_404(
            TextBlock,
            id=word_id,
            page__number=number,
            page__document__identifier=identifier,
            page__document__collection__slug=collection_slug,
            page__document__collection__owner__short_name=short_name,
        )
        try:
            # earliest() will be the creation record
            original = word.history.earliest()
            word = original.instance
            word._change_reason = "Revert to original"
            word.save()
            response = {
                "id": word.id,
                "text": word.text,
                "confidence": float(word.confidence),
                "confidence_level": word.confidence_level,
                "suggestions": dict(word.suggestions)
                if isinstance(word.suggestions, list)
                else word.suggestions,
                "text_type": word.text_type,
                "text_type_display": TextBlock.TEXT_TYPE_CHOICES.get(word.text_type),
                "print_control": word.print_control,
                "print_control_display": TextBlock.PRINT_CONTROL_CHOICES.get(
                    word.print_control
                ),
            }
            status = 200
        except ObjectDoesNotExist:
            # Some existing text blocks may not have an audit history
            response = {"error": "No prior version to revert to"}
            status = 400
        return JsonResponse(response, status=status)

    except Exception as e:
        logger.error(f"Error reverting word {word_id}: {e}")
        return JsonResponse({"error": "Failed to revert word"}, status=500)


@require_http_methods(["POST"])
def merge_blocks(request, short_name, collection_slug, identifier, number):
    """
    Combine two text blocks into new third text block.

    Requires a text block ID in the request body, which will be combined with the prior word on that line.
    The submitted text block can be in any word visibility control status, but it must have at least one INCLUDE word before it on the same line.
    """
    response = {}
    status = 400
    try:
        right_block = get_object_or_404(TextBlock, id=request.POST.get("block"))

        # Find the printable words on this line before the selected one, and take the last as our merge target
        # TextBlock orders by line+number so we can trust last() to return the correct one
        left_block = TextBlock.objects.filter(
            page=right_block.page,
            line=right_block.line,
            number__lt=right_block.number,
            print_control=TextBlock.INCLUDE,
        ).last()

        if not left_block:
            response = {
                "error": "The selected word must have another printable word before it on the same line"
            }

        else:
            new_block = TextBlock()

            # Concatenate the blocks' text with no space
            new_block.text = f"{left_block.text}{right_block.text}"

            # Use block 1's info except where we need block 2's
            new_block.text_type = left_block.text_type
            new_block.page = left_block.page
            new_block.line = left_block.line
            new_block.number = left_block.number
            new_block.confidence = TextBlock.CONF_ACCEPTED
            # Don't assume block_1 is the first.
            # Take the smallest (x,y)0 and the largest (x,y)1 to get the full boundary corners
            new_block.geo_x_0 = min(left_block.geo_x_0, right_block.geo_x_0)
            new_block.geo_y_0 = min(left_block.geo_y_0, right_block.geo_y_0)
            new_block.geo_x_1 = max(left_block.geo_x_1, right_block.geo_x_1)
            new_block.geo_y_1 = max(left_block.geo_x_1, right_block.geo_x_1)

            with transaction.atomic():
                left_block.print_control = TextBlock.MERGE
                left_block.save()

                right_block.print_control = TextBlock.MERGE
                right_block.save()

                new_block.save()

                response = {
                    "new": {
                        "id": new_block.id,
                        "text": new_block.text,
                        "confidence": float(new_block.confidence),
                        "confidence_level": new_block.confidence_level,
                        "suggestions": dict(new_block.suggestions)
                        if isinstance(new_block.suggestions, list)
                        else new_block.suggestions,
                    },
                    "merged_left": left_block.id,
                    "merged_right": right_block.id,
                }
                status = 201

        return JsonResponse(response, status=status)

    except Exception as e:
        logger.error(f"Error merging text blocks: {e}")
        return JsonResponse({"error": "Failed to merge text"}, status=500)
