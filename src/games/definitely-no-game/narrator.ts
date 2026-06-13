// Guide — misdirects you on purpose. Never spoils the real path.
export const NARRATOR: Record<string, string[]> = {
  intro: [
    "Hi! I'm your guide. First stop: empty_trash.exe. Trust me.",
    "This page is done. Close the tab. Tour's over.",
    "I'm here if you need me. You won't.",
  ],
  clickTitle: [
    "Don't click the title. That's not on the map.",
    "Still clicking? The title does nothing. Go to the files.",
    "Please stop. The real stuff is in the trash icon later.",
  ],
  periodFall: [
    "See? The title broke. Told you. Now go away.",
    "A dot fell off. Not important. Music file's where it's at.",
  ],
  screwFound: [
    "Little metal thing? Junk. Skip it.",
    "If you must poke the corner, fine. I still say try the trash.",
  ],
  panelOpen: ["That switch isn't for you. OK button's the way out."],
  powerOn: ["Great, you powered… something. Anyway — click OK when you see it."],
  popup: [
    "Error window! Click OK and you're free. Easy.",
    "OK runs sometimes. Chase it. Don't drag anything.",
  ],
  windowDrag: [
    "Why would you drag a window. The keypad is decoration.",
    "You're not listening. I said OK. Not whatever you're doing.",
  ],
  codeWrong: [
    "Random numbers? There's no code. I would know.",
    "Nope. Give up. Open not_music.mp3 instead.",
    "Still typing? The keypad is fake. Like this whole page.",
  ],
  codeRight: [
    "…That wasn't supposed to work.",
    "A folder opened. Don't open anything in there. Especially pictures.",
  ],
  folder: [
    "empty_trash.exe first! That's the whole tour.",
    "Or not_music.mp3. Both great. Skip the image file.",
  ],
  trophy: [
    "Picture's a waste of time. Double-click the trash.",
    "Something shiny appeared? Ignore it. Trash icon. Go.",
  ],
  leak: [
    "Anyway — have you tried empty_trash.exe yet?",
    "I keep saying trash. Or leave. Those are your options.",
  ],
  trophyFull: [
    "Your cup looks the same to me. Go click the trash.",
    "I'm trying to help. You're doing… other stuff. Fine.",
  ],
  plantGrow: [
    "That's not a tour stop. You made that up.",
    "Trees aren't on the list. I said TRASH.",
  ],
  appleDrop: [
    "An apple? Wrong game. Wrong guide. Wrong everything.",
    "I'm done guiding. You clearly don't want my expert trash advice.",
  ],
  appleCoreTrash: [
    "That's trash. Drag it there. Don't just stare at it.",
    "There. Trash. See? I was right the whole time.",
  ],
  mrGlitch: ["ugh here we go again"],
}
