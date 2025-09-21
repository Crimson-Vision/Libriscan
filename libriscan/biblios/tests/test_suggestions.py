from django.test import TestCase

from biblios.services.suggestions import long_s_conversion

class SuggestionTests(TestCase):
    def test_long_s_conversion(self):
        test_words = (
            ("fuccefsful", "successful"),
            # keep an f before an apostrophe
            ("clof'd", "clof'd"),
            ("fatisfaction", "satisfaction"),
            ("crofs-stitch", "cross-stitch"),
            ("fong", "song"),
            ("ufe", "use"),
            ("prefs", "press"),
            ("fubftitute", "substitute"),
            # keep an f at the end of a word, or a dash
            ("leaf-blower", "leaf-blower"),
            ("half", "half"),
            # Keep uppercase F
            ("Fit", "Fit"),
            ("theſletter", "thesletter")
        )
        for test, correct in test_words:
            self.assertEqual(long_s_conversion(test), correct)