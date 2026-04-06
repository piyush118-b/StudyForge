import confetti from 'canvas-confetti'

export function fireCompletionConfetti() {
  // Emerald-themed confetti burst
  confetti({
    particleCount: 80,
    spread:        60,
    origin:        { y: 0.6 },
    colors:        ['#10B981', '#34D399', '#059669', '#6EE7B7', '#A7F3D0'],
    ticks:         200,
    gravity:       0.8,
    scalar:        0.9,
    shapes:        ['circle', 'square'],
  })

  // Second burst slightly delayed
  setTimeout(() => {
    confetti({
      particleCount: 40,
      spread:        80,
      origin:        { x: 0.2, y: 0.7 },
      colors:        ['#10B981', '#34D399'],
      ticks:         150,
    })
    confetti({
      particleCount: 40,
      spread:        80,
      origin:        { x: 0.8, y: 0.7 },
      colors:        ['#10B981', '#34D399'],
      ticks:         150,
    })
  }, 200)
}
