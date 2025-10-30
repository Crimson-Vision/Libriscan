import re
from string import punctuation

from spellchecker import SpellChecker

spell = SpellChecker()

# This app probably won't see such heavy use that compiling the regex will make a noticable difference,
# but it doesn't hurt and makes it easier to read when we do use it.

# Regex: matches a lowercase 'f' or 'ſ' that's not after an f or s, before another f, or at the end of the word
# (?<!f|s) = negative lookbehind, only match the next character if it's not after an 'f' or 's'
# [fſ] = the exact letter 'f' or, just in case, the actual long-s 'ſ'
# (?!f|-|\'|$) = negative lookahead, only match the previous character if it's not before another 'f', an
#                apostrophe, a hyphen, or the end of the string
LONG_S_REGEX = re.compile("(?<!f|s)[fſ](?!f|-|'|$)")


def long_s_conversion(word, modern=True):
    """Replace every potential misidentified long-s with the correct version of the letter."""
    # The replacement letter is the real long-s character if modern = False, but s by default
    s = "s" if modern else "ſ"

    return re.sub(LONG_S_REGEX, s, word)


def generate_suggestions(wrd, long_s_detect, s=3):
    """
    Find possible spellcheck suggestions of a word and its variants, and return the top n candidates.

    wrd (str): the potentially misspelled word
    long_s_detect (bool): whether to use long-s detection rules
    s (int): the number of suggestions to return

    Returns a list of (suggestion, frequency) tuples.
    """

    words = [
        wrd,
    ]

    # If the caller wants long s detection, find that variant
    if long_s_detect:
        c = long_s_conversion(wrd)
        if c != wrd:
            words.append(c)

    # Since there are likely to be duplicate candidates for the words, guarantee uniqueness by using a set
    suggestions = set()

    for word in words:
        # Sometimes the last letter of the word is punctuation, like a comma or period.
        # Pull it off, generate the suggestions, and then add it back in later
        if word[-1] in punctuation:
            last_letter = word[-1]
            word = word[:-1]
        else:
            last_letter = ""

        # Pyspellchecker will convert to lowercase, so check for common capitalization schemes.
        # Check for all lowercase first, since that's most common
        if word.islower():
            case = None  # nothing to do in this case
        elif not word:
            case = None  # We might have any characters left if the word was a single punctuation mark
        elif word[0].isupper() and word[1:].islower():  # there's no iscapitalize method
            case = str.capitalize
        elif word.isupper():
            case = str.upper
        elif word.istitle():
            case = str.title
        else:
            case = None

        candidates = spell.candidates(word)
        if candidates:
            for candidate in candidates:
                # Apply any casing rule identified above
                if case:
                    candidate = case(candidate)

                suggestions.add(
                    (f"{candidate}{last_letter}", spell.word_frequency[candidate])
                )

    # If the *only* suggestion is an exact match for the word, don't return anything
    if len(suggestions) == 1 and min(suggestions)[0] == wrd:
        return []
    else:
        # Sort the suggestions by their frequency, descending
        suggestions = sorted(suggestions, key=lambda c: c[1], reverse=True)

        return suggestions[:s]
