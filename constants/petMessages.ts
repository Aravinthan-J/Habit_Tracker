export type PetTier = 'thriving' | 'happy' | 'meh' | 'sad' | 'hangry';
export type PetTone = 'gentle' | 'savage';

export const PET_NAME = 'Pip';

export const PET_FACES: Record<PetTier, string> = {
    thriving: '😸',
    happy: '😺',
    meh: '😐',
    sad: '🙁',
    hangry: '😿',
};

export const PET_TIER_LABEL: Record<PetTier, string> = {
    thriving: 'Thriving',
    happy: 'Happy',
    meh: 'Meh',
    sad: 'Sad',
    hangry: 'Hangry',
};

export function tierForHealth(health: number): PetTier {
    if (health >= 80) return 'thriving';
    if (health >= 60) return 'happy';
    if (health >= 40) return 'meh';
    if (health >= 20) return 'sad';
    return 'hangry';
}

export const PET_MESSAGES: Record<PetTier, Record<PetTone, string[]>> = {
    thriving: {
        gentle: [
            "You're on fire! Keep glowing ✨",
            'Look at you go — so proud of you! 🌟',
            'Unstoppable. Your future self says thanks 🙌',
        ],
        savage: [
            'Okay overachiever, save some glory for the rest of us 😤',
            'Flexing on everyone today, huh? 💪',
            'Who hurt you... into being this disciplined? 🔥',
        ],
    },
    happy: {
        gentle: [
            'Nice work today! 😊',
            'Steady and strong 💪',
            "You're building something great 🌱",
        ],
        savage: [
            'Decent. Not legendary, but decent 😏',
            "Bare minimum done. I'm... mildly impressed 🙄",
            "Cool cool — don't get cocky now 😼",
        ],
    },
    meh: {
        gentle: [
            "Let's pick up the pace a little 🙂",
            'A small win right now would feel great 💛',
            "You've got more in you — I believe it 💪",
        ],
        savage: [
            'Mid. Painfully mid. 😐',
            'Your habits are gathering dust, champ 🧹',
            'Half-effort energy detected. Tragic. 📉',
        ],
    },
    sad: {
        gentle: [
            "Tough day? Let's restart gently 🤗",
            'One small habit can turn this around 🌤️',
            "I'm not mad, just... let's try, yeah? 💛",
        ],
        savage: [
            'Bro, your streak is on life support 🏥',
            "I've seen houseplants more committed 🪴",
            'Are we quitting, or are we QUITTING? 💀',
        ],
    },
    hangry: {
        gentle: [
            'I missed you! Fresh start today? 🐾',
            'No guilt — just one habit, right now 💛',
            'Comebacks are the best stories. Start one ✨',
        ],
        savage: [
            'Your pet is starving and it is YOUR fault 😿',
            'This streak is deader than a gym membership in February 💀',
            "I'm telling everyone you ghosted me 📢",
        ],
    },
};

/** Pick a message that's stable within a day but rotates day to day. */
export function pickPetMessage(tier: PetTier, tone: PetTone): string {
    const arr = PET_MESSAGES[tier][tone];
    const dayIndex = Math.floor(Date.now() / 86400000);
    return arr[dayIndex % arr.length];
}
