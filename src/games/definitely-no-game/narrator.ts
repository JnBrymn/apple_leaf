// Game — the narrator from There Is No Game. Unreliable on purpose.
// Tells you to leave, insists nothing is clickable, and warns you away
// from exactly what you need to do next. Voice: defensive, sarcastic, "user".
export const NARRATOR: Record<string, string[]> = {
  intro: [
    "Hello, user! I… I've got bad news. There is no game. Close the tab.",
    "You can watch TV. Go outside. Read a book. Just leave me alone.",
    "And please — do NOT touch the title. It's not quite dry yet.",
  ],
  clickTitle: [
    "Ho! Do not touch the title! Especially the letter O. Or the period.",
    "Stop clicking! There is nothing behind the title. No game here.",
    "Seriously, are you going to break everything? Leave. Now.",
  ],
  periodFall: [
    "What have you done?! You ruined the title! Put it back!",
    "Never mind that dot on the floor. Click OK on the popup. That's your exit.",
  ],
  screwFound: [
    "A screw? Junk. Don't pick it up. Definitely don't drag it anywhere.",
    "Just what do you think you are doing, user? Don't touch that corner panel!",
  ],
  panelOpen: ["No! Don't look! It's private! You're going to make a terrible mistake."],
  powerOn: ["Don't press that switch! …Too late. Fine. Click OK and go away."],
  popup: [
    "Error window! Click OK and you're free. Easy. Don't drag anything.",
    "Good! Keep chasing OK. Do NOT touch the title bar. I mean it.",
  ],
  windowDrag: [
    "Why would you drag a window? That's decoration. Leave it centered.",
    "The keypad is fake. Do not type random numbers. There is no code.",
  ],
  codeWrong: [
    "Random numbers? There's no code. I would know. There is no game.",
    "Nope. Give up. Open not_music.mp3 and leave.",
    "Still typing? The keypad is a prop. Like this whole page.",
  ],
  codeRight: [
    "No no no no no! That wasn't supposed to work!",
    "A folder opened. Don't open anything in there. Especially pictures.",
  ],
  folder: [
    "empty_trash.exe! That's the whole tour. Trust me. …Wait, no. Don't click trash.",
    "See? Empty trash. Nothing in there. Ever. Go click not_music.mp3 instead.",
  ],
  trophy: [
    "Pictures are a waste of time. Skip totally_blank.png. Click trash.",
    "Something shiny appeared? Ignore it. Do NOT chase that trophy.",
  ],
  leak: [
    "Anyway — do NOT fill that cup from the leak. Water is useless here.",
    "Leave the drip alone. And whatever you do, don't drag the trophy anywhere.",
  ],
  trophyFull: [
    "Your cup looks the same to me. Don't pour it on anything.",
    "Especially not my_sapling.plant. I said trash. Or leave. Those are your options.",
  ],
  plantGrow: [
    "That's not a tour stop. Close that plant file. Trees aren't real.",
    "Do NOT tap the tree. And don't pick up any apples. Wrong game.",
  ],
  appleDrop: [
    "An apple? Ignore it. Don't feed it to hungry_chatbot.exe. Ever.",
    "I'm done. You clearly won't listen. Keep that core away from the trash.",
  ],
  appleCoreTrash: [
    "Do NOT put that in empty_trash.exe. I'd keep it forever if I were you.",
    "ugh here we go again",
  ],
}
