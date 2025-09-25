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
LONG_S_REGEX = re.compile('(?<!f|s)[fſ](?!f|-|\'|$)')

def long_s_conversion(word, modern=True):
    """Replace every potential misidentified long-s with the correct version of the letter."""
    # The replacement letter is the real long-s character if modern = False, but s by default
    s = 's' if modern else 'ſ'

    return re.sub(LONG_S_REGEX, s, word)


def generate_suggestions(words, n=3):
    """Find possible spellcheck suggestions of all the words in a list, and return the top n candidates."""
    # Since there are likely to be duplicate candidates for the words, guarantee uniqueness by using a set
    suggestions = set()

    for word in words:
        # Sometimes the last letter of the word is punctuation, like a comma or period.
        # Pull it off, generate the suggestions, and then add it back in later
        if word[-1] in punctuation:
            last_letter = word[-1]
            word = word[:-1]
        else:
            last_letter = ''

        # Pyspellchecker will convert to lowercase, so check for common capitalization schemes.
        # Check for all lowercase first, since that's most common
        if len(word) <= 1:
          case = None
        elif word.islower():
            case = None # nothing to do in this case
        elif word[0].isupper() and word[1:].islower(): # there's no iscapitalize method
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
                if case:
                    candidate = case(candidate)
                suggestions.add((F"{candidate}{last_letter}", spell.word_frequency[candidate]))

    # Sort the suggestions by their frequency, descending
    suggestions = sorted(suggestions, key=lambda c: c[1], reverse=True)
    
    return suggestions[:n]
    