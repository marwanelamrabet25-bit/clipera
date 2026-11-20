from clipera_worker.captions.ass import CaptionOptions, Word, _ass_color, _ts, build_ass, group_lines


def words(text: str, start=0.0, step=0.3):
    out, t = [], start
    for w in text.split():
        out.append(Word(w, round(t, 3), round(t + step - 0.05, 3)))
        t += step
    return out


def test_color_and_timestamp_format():
    assert _ass_color("#8B5CF6") == "&H00F65C8B"
    assert _ass_color("#A78BFA", 0x80) == "&H80FA8BA7"
    assert _ts(0) == "0:00:00.00"
    assert _ts(3725.456) == "1:02:05.46"


def test_lines_break_on_punctuation_gap_and_length():
    ws = words("Bonjour à tous. Aujourd'hui on parle de clipping vidéo")
    ws.append(Word("ensuite", 10.0, 10.4))  # long silence avant
    lines = [" ".join(w.text for w in line) for line in group_lines(ws, max_words=3)]
    assert lines[0] == "Bonjour à tous."
    assert all(len(line.split()) <= 3 for line in lines)
    assert lines[-1] == "ensuite"


def test_classic_one_event_per_line_no_overlap():
    ass = build_ass(words("un deux trois quatre cinq six sept huit"), width=1080, height=1920)
    events = [line for line in ass.splitlines() if line.startswith("Dialogue")]
    assert len(events) == 2
    assert "PlayResY: 1920" in ass and "Style: Main,Inter," in ass
    end_first = events[0].split(",")[2]
    start_second = events[1].split(",")[1]
    assert end_first <= start_second


def test_highlight_marks_active_word():
    ass = build_ass(words("salut les amis"), width=1080, height=1920, opts=CaptionOptions(style="highlight"))
    events = [line for line in ass.splitlines() if line.startswith("Dialogue")]
    assert len(events) == 3
    assert "{\\c&H00FA8BA7}salut" in events[0]
    assert "{\\c&H00FA8BA7}amis" in events[2]


def test_modern_uppercase_and_user_text_is_escaped():
    ass = build_ass([Word("{\\pos(0,0)}hack", 0, 1)], width=1080, height=1920, opts=CaptionOptions(style="modern"))
    event = [line for line in ass.splitlines() if line.startswith("Dialogue")][0]
    assert "\\pos" not in event.replace("\\\\pos", "")  # pas d'injection de balise ASS
    assert "HACK" in event


def test_size_is_moderate():
    ass = build_ass(words("test"), width=1080, height=1920)
    size = int([line for line in ass.splitlines() if line.startswith("Style:")][0].split(",")[2])
    assert 50 <= size <= 80  # « sous-titres pas trop grands »
