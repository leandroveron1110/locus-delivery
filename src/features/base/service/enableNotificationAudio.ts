let notificationAudioContext: AudioContext | null = null;

async function enableNotificationAudio() {
  if (typeof window === "undefined") return;

  if (!notificationAudioContext) {
    notificationAudioContext = new AudioContext();
  }

  if (notificationAudioContext.state === "suspended") {
    await notificationAudioContext.resume();
  }

  playNotificationTones([523]);
}

function playNotificationTones(frequencies: number[]) {
  const context = notificationAudioContext;

  if (!context || context.state !== "running") return;

  frequencies.forEach((frequency, index) => {
    const oscillator = context.createOscillator();
    const gain = context.createGain();

    const startAt = context.currentTime + index * 0.18;

    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(frequency, startAt);

    gain.gain.setValueAtTime(0.0001, startAt);
    gain.gain.exponentialRampToValueAtTime(0.2, startAt + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, startAt + 0.14);

    oscillator.connect(gain);
    gain.connect(context.destination);

    oscillator.start(startAt);
    oscillator.stop(startAt + 0.15);
  });
}

function playNewDispatchSound() {
  playNotificationTones([660, 880]);
}

function playNewQuoteSound() {
  playNotificationTones([1046, 1318]);
}