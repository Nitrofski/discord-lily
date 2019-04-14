# LilyPond 101

### What is LilyPond?

LilyPond is a highly sophisticated music engraver that uses plain text input to produce music scores. It's like LaTeX for music.
```
\relative c' {
    \key d \minor
    \time 3/4
    bes8 d'32( c bes c bes a bes a g a g f g a bes c d16) bes,
    a32 a'( b cis d16) a, g32 a'( b cis d16) g,, a32 d'( cis b cis16) g
}
```
![](https://cdn.discordapp.com/attachments/559837241170460692/566712878606974998/lily.png)

### What is Lily?

Lily is a simple yet powerful Discord bot for producing neat musical snippets in LilyPond without having to worry about details like version commands or page formatting. Input LilyPond syntax and it just works.

### This guide

This guide is tailored to new users of LilyPond and users of the Lily Discord bot. Although thorough, it doesn't cover everything, particularly as far as specialist instrument notation is concerned, and topics such as page formatting, styles and tweaks are ignored. For help with anything specific, Google and the LilyPond documentation are your best friends.ma

### Basic syntax

Every piece of LilyPond input must have `{` curly braces `}` placed around the input. These braces tell LilyPond that the input is a single music *expression*, just like parentheses () in mathematics. The braces should be surrounded by a space unless they are at the beginning or end of a line to avoid ambiguities.
```
{ c d e f g a b c } % NOT c d e f g a b c
```
LilyPond input is case-sensitive. `c` is not the same as `C`.
```
{ c d e f g a b c } % NOT { C D E F G A B C }
```
LilyPond ignores extra whitespace, so extra spaces can be used to make the layout clearer. However, spaces are still required to separate syntactical elements from each other.
```
{ c d e f g a b c } % is equivalent to:
{ c        d e f   g a    b c }
% But { cdefg abc} will fail!
```
LilyPond supports comments. Anything after a `%` is ignored until the next newline, and anything between `%{` and `%}` is ignored.
```
{ c d e % f g a b c
  d e %{ f g a b c
  d e f g %} a b c }
% is equivalent to:
{ c d e d e a b c }
```

### Absolute and relative input

By default, LilyPond uses *absolute* note input, where the note names `c` to `b` are engraved in the octave below middle C.
```
{ \clef bass c d e f g a b c d e f g }
```
![](https://cdn.discordapp.com/attachments/563226315386257408/566870873341034496/lily.png)  

Higher octaves are indicated with `'`s and lower octaves with `,`s.
```
{ \clef bass c, b, c b \clef treble c' b' c'' b'' }
```
![](https://cdn.discordapp.com/attachments/563226315386257408/566680236532432925/lily.png)  

Since writing things such as `a''''` and `c,,` quickly becomes tedious, LilyPond offers a more practical alternative, *relative* note input, which will be used for the rest of this tutorial. To input music in relative mode, place `\relative` before the music expression like below.
```
\relative { g' a b c d e f g }
```
![](https://cdn.discordapp.com/attachments/563226315386257408/566715809871822849/lily.png)  

The first note of a relative block is specified as in absolute mode, and every other note is the closest neighbour to the previous one by default.
```
\relative { c'' d c e c f c g c a c b }
```
![](https://cdn.discordapp.com/attachments/563226315386257408/566690662968459274/lily.png)  

To input intervals of more than a fourth, use `'`s and `,`s.
```
\relative { c' d c e c f c g' c, a' c, b' }
```
![](https://cdn.discordapp.com/attachments/563226315386257408/566694470955827201/lily.png)  

A more complicated example:
```
\relative { c' c' e, g, d'' d, e e'' }
```
![](https://cdn.discordapp.com/attachments/563226315386257408/566392306094047253/lily.png)  

### Accidentals

Sharps and flats are indicated by `is` and `es` respectively.
```
\relative { c' cis fis bes ees, eeses gis fisis }
```
![](https://cdn.discordapp.com/attachments/563226315386257408/566699464828649512/lily.png)  

Accidentals must be specified for every note; F♮ is always written `f` and F♯ always as `fis`. (If you're wondering why, think about it this way: the user indicates the *semantic* content of the music, and LilyPond handles the display of accidentals automatically based on previous notes and the key signature.)
```
\relative { f' f fis fis fis f f fis }
```
![](https://cdn.discordapp.com/attachments/563226315386257408/566699581350477864/lily.png)  

Accidentals are ignored in the “closest neighbour” logic used in relative mode.
```
\relative { c'' fis c ges c ges' c, fis, }
```
![](https://cdn.discordapp.com/attachments/563226315386257408/566704025018433576/lily.png)  

To force accidentals to be displayed, use `!` or `?`. (Although it's better just to let LilyPond handle things automatically.)
```
\relative { c'' c c! c? cis cis cis! cis? }
```
![](https://cdn.discordapp.com/attachments/563226315386257408/566704385091174410/lily.png)  

### Note durations

Quarter notes are indicated by a `4`, eighth notes by an `8` and so on. Breves have their own command.
```
\relative { \time 4/2 c'\breve d1 e2 f4 g8 a16 b32 c64 d }
```
![](https://cdn.discordapp.com/attachments/563226315386257408/566672557626097715/lily.png)  

Notes without a specified duration will take the duration of the previous note.
```
\relative { c'8 e g c b16 a g f e4 }
```
![](https://cdn.discordapp.com/attachments/563226315386257408/566672914934661120/lily.png)  

Dots are expressed with one or more `.`s placed after the note duration.
```
\relative { c'4. d8 e8.. f32 g8. a32 b c4 c2. c,4 }
```
![](https://cdn.discordapp.com/attachments/563226315386257408/566639492165795851/lily.png)  

Ties are written with a `~` after the note.
```
\relative { fis'4~ fis16 ees'8.~ ees8 d16 c g4 }
```
![](https://cdn.discordapp.com/attachments/563226315386257408/566639608067129346/lily.png)  

### Tuplets and grace notes

Triplets and other tuplets can be entered using the syntax `\tuplet %fraction% { %music% }`.
```
\relative { a'2 \tuplet 3/2 { b4 b b }
            c \tuplet 5/4 { b8 a g fis e } a2 }
```
![](https://cdn.discordapp.com/attachments/563226315386257408/566640828303540224/lily.png)  

To make entering multiple tuplets easier, you can specify the length of a single tuplet to group multiple tuplets automatically.
```
\relative { \tuplet 3/2 4 { c'8 d e f16 g a8 b c4 g8 } c,4 }
```
![](https://cdn.discordapp.com/attachments/563226315386257408/566716752478732304/lily.png)  

Grace notes are indicated using the `\grace` command. Connoisseurs can choose from `\acciaccatura`, `\appoggiatura` and `\slashedGrace`.
```
\relative { c' \acciaccatura { d8 } c4 \grace { f32( e d } c2) }
```
![](https://cdn.discordapp.com/attachments/563226315386257408/566654574434320385/lily.png)  

### Time signatures

Time signatures are indicated with the `\time %fraction%` syntax. By default, LilyPond uses `4/4`.
```
\relative { \time 3/8 c''8 b a \time 5/4 g4 f e d c }
```
![](https://cdn.discordapp.com/attachments/563226315386257408/566632044566937620/lily.png)  

Pickup bars or *anacruses* are specified with the `\partial %duration%` command.
```
\relative { \time 6/8 \partial 8 c' f g a bes a g }
```
![](https://cdn.discordapp.com/attachments/563226315386257408/566632623401730068/lily.png)  

Irregular beat grouping can be indicated with the following syntax:
```
\relative { \time #'(2 2 3) 7/8 e''8 d e g, a d c }
```
![](https://cdn.discordapp.com/attachments/563226315386257408/566632824350965760/lily.png)  

### Key signatures

Key signatures are indicated with the `\key %note% \%key%` syntax. By default, LilyPond uses C major.
```
\relative { \key b \minor b cis d e \key bes \major f g a bes }
```
![](https://cdn.discordapp.com/attachments/563226315386257408/566634245381029910/lily.png)  

Modes can also be used as keys.
```
\relative { \key d' \mixolydian d8 e fis g a b c d }
```
![](https://cdn.discordapp.com/attachments/563226315386257408/566634504748531712/lily.png)

### Clefs  

Clefs are indicated with the `\clef %clefname%` syntax. The clef names can optionally be surrounded by `"`s. By default, LilyPond uses treble clef.
```
\relative { \clef bass d e g c \clef "tenor" d e g a }
```
![](https://cdn.discordapp.com/attachments/563226315386257408/566676754018730046/lily.png)  

Octave clefs can be specified. Because of the `_` and `^` symbols used, `"`s around the clef name are required. Note that notes are entered in concert pitch.
```
\relative { \clef "treble^15" e''' a d g c \clef "bass_8" e,,,,,, d g, }
```
![](https://cdn.discordapp.com/attachments/563226315386257408/566677062958710784/lily.png)  

A list of clef styles can be found [here](http://lilypond.org/doc/v2.19/Documentation/notation/clef-styles).

### Rests

Rests are indicated by an `r`. *Spacer* rests indicated by an `s` are invisible.
```
\relative { r2 r4 c'' r r8 r s4 r }
```
![](https://cdn.discordapp.com/attachments/563226315386257408/566584095279284224/lily.png)  

Use a capital `R` to enter full bar rests. It's usually easiest to write `R1*time signature*number of empty bars`.
```
{ \time 3/4 R1. \time 5/4 R1*5/4*3 }
```
![](https://cdn.discordapp.com/attachments/563226315386257408/566580763617656843/lily.png)  

### Slurs

Slurs are indicated with `()`s. Don't forget to close any slurs you open.
```
\relative { c'8( d e4~ e16 f g8) c4 }
```
![](https://cdn.discordapp.com/attachments/563226315386257408/566580902411632650/lily.png)  

Slurs cannot be nested, although *phrasing slurs* `\(` `\)` can be used to provide two tiers of slur.
```
\relative { c'\( d( e) f\) }
```
![](https://cdn.discordapp.com/attachments/563226315386257408/566581120796327938/lily.png)  

### Dynamics and articulation

Most articulation and dynamics use the `note\%indication%` syntax. All dynamics are attached to notes.
Dynamics are given with indications like `\mp` and `\ff`:
```
\relative { c'2\pp d\mf e\sfz f\fff }
```
![](https://cdn.discordapp.com/attachments/563226315386257408/566635997308125235/lily.png)  

By default, LilyPond has commands for `\ppppp` to `\fffff`, as well as `\fp`, `\sf`, `\sff`, `\sp`, `\spp`, `\sfz`, and `\rfz`.

Crescendos and diminuendo hairpins are started with `\<` and `\>`. They terminate at the next dynamic, crescendo/diminuendo marking, or `\!` mark.
```
\relative { c'\< d e f\ff c\> d e\< f c d e\! f }
```
![](https://cdn.discordapp.com/attachments/563226315386257408/566636135351189507/lily.png)    

Text crescendos and diminuendos are given by `\cresc` and `\decresc`.
```
\relative { c'8\p\cresc d e f g a b c b\decresc a g f e d c4\pp }
```
![](https://cdn.discordapp.com/attachments/563226315386257408/566636261075582986/lily.png)  

Articulations and ornamentation are given with indications like `\accent` and `\marcato`:
```
\relative { c''4\staccato c\mordent b2\turn c1\fermata }
```
![](https://cdn.discordapp.com/attachments/563226315386257408/566636430768603139/lily.png)  

`\staccato`, `\accent`, `\tenuto`, `\staccatissimo`, `\marcato`, `\portato` and `\stopped` have fairly predictable predefined shortcuts:
```
\relative { c''-. c-> c-- c-! c-^ c-_ c2-+ }
```
![](https://cdn.discordapp.com/attachments/563226315386257408/566636584456159242/lily.png)  

A full list of articulations and ornaments can be found [here](http://lilypond.org/doc/v2.18/Documentation/notation/list-of-articulations).

### Chords

A chord is formed by enclosing a set of pitches between `<` and `>`. Chords may be followed by durations, dynamics, articulation just like ordinary notes.
```
\relative { c' <c e g> <e g c>2-> <g c e>4.(\f <f a d>8 <e g c>2) }
```
![](https://cdn.discordapp.com/attachments/563226315386257408/566719702429073428/lily.png)  

To repeat the previous chord, use `q`. It works even if non-chorded notes or rests have been used after the last chord entered.
```
\relative { c' <e g c> q q c'' r q q }
```
![](https://cdn.discordapp.com/attachments/563226315386257408/566724537916456964/lily.png)  

Some constructs like ties and articulation can also be attached to individual notes within chords.
```
\relative { c'8 <c e~> e16 f g8 <f-+ a-+>~ q8. r16 }
```
![](https://cdn.discordapp.com/attachments/563226315386257408/566721605338660878/lily.png)  

In relative mode, the first note in a chord takes its octave from the music before it, the other notes within a chord take their octave from the previous note *within* the chord, and notes after a chord take their octave from the *first* note of the previous chord.
```
\relative { <c'' e g> <c, g' b'> <d f c'> <a' f' c'> }
```
![](https://cdn.discordapp.com/attachments/563226315386257408/566925328329736192/lily.png)  

Study this next example carefully.
```
\relative { c' <c e g> <c' e g'> <c, e, g''> }
```
![](https://cdn.discordapp.com/attachments/563226315386257408/566722704032530432/lily.png)  

### Repeats

Repeats are one of the most powerful constructs in LilyPond, allowing much music to be written over and over

Repeats in LilyPond follow this syntax: `\repeat %keyword% %no. of repeats% %music expression%`.

The `unfold` keyword writes out repeats in full.
```
\relative { \repeat unfold 2 { c'' c g' g a a g2 } }
```
![](https://cdn.discordapp.com/attachments/563226315386257408/566929978751582261/lily.png)  

Repeats can be of any length. Very short repeats are particularly convenient for entering repetitive music.
```
\relative { \repeat unfold 4 { c''16 d } \repeat unfold 4 { e d } }
```
![](https://cdn.discordapp.com/attachments/563226315386257408/566929414097600513/lily.png)  

The `volta` keyword writes repeats using the familiar repeat signs.
```
\relative { \repeat volta 2 { c'' c g' g a a g2 } }
```
![](https://cdn.discordapp.com/attachments/563226315386257408/566930384927981572/lily.png)

Alternative endings are written with the `\alternative { }` syntax. Each alternative ending must have its own pair of `{}`s.
```
\relative { \repeat volta 2 { c'' c g' g }
            \alternative {
              { a a g2 }
              { aes4 aes g2 }
            } f4 f e e
          }
```
![](https://cdn.discordapp.com/attachments/563226315386257408/566931314050072603/lily.png)

There's no limit on the number of alternative endings. If there are more repeats than alternatives, the first alternative is repeated several times to compensate.
```
\relative { \repeat volta 5 { c'' c g' g }
            \alternative {
              { a a g2 }
              { aes4 aes g2 }
              { bes4 bes g2 }
            } f4 f e e
          }
```
![](https://cdn.discordapp.com/attachments/563226315386257408/566932187782316033/lily.png)  

Alternative endings can be used with `unfold` too. In general, switching `unfold` for `volta` will produce the same music except written out in full.
```
\relative { \repeat unfold 5 { c'' c g' g }
            \alternative {
              { a a g2 }
              { aes4 aes g2 }
              { bes4 bes g2 }
            } f4 f e e
          }
```
![](https://cdn.discordapp.com/attachments/563226315386257408/566932706563194880/lily.png)  

As before, repeats and alternatives can be as long or short as desired. Note that notes at the start of an alternative ending inherit their duration and octave from the last note of the previous alternative:
```
\relative { \repeat unfold 2 { g'16 f e d c g' }
            \alternative {
              { a f }
              { c' b }
            }
          }
```
![](https://cdn.discordapp.com/attachments/563226315386257408/566933512058437633/lily.png)  

There are two other, less common repeat keywords: `percent` and `tremolo`. `percent` refers to the slashed repeat signs used in some kinds of music to denote repetitions:
```
\relative { \repeat percent 4 { c''8 d } \repeat percent 4 { c16 d e f } }
```
![](https://cdn.discordapp.com/attachments/563226315386257408/566935318020882444/lily.png)  
```
\relative { \repeat percent 3 { c'' d e f } \repeat percent 2 { c2 d e f } }
```
![](https://cdn.discordapp.com/attachments/563226315386257408/566935762038161418/lily.png)  

`tremolo` is used for tremolos.
```
\relative { \repeat tremolo 6 { c''16 e } \repeat tremolo 4 { b32 d } }
```
![](https://cdn.discordapp.com/attachments/563226315386257408/566936666552533002/lily.png)  

Tremolos on a single note can be obtained either by applying `\repeat tremolo` to a single note or by using the `note:N` syntax, where `N` must be at least 8.
```
\relative { \repeat tremolo 16 { c''32 } d4:16 e8:16 f8:16 g1:32 }
```
![](https://cdn.discordapp.com/attachments/563226315386257408/566938424586797066/lily.png)  

Like almost everything else in LilyPond, repeats can be nested.
```
\relative { \repeat percent 3 { \repeat unfold 4 { c''8 d } } }
```
