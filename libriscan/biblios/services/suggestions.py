import re

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

    # Replace the fs with the real long-s character if modern = False, but assume the user wants s by default
    s = 's' if modern else 'ſ'

    return re.sub(LONG_S_REGEX, s, word)