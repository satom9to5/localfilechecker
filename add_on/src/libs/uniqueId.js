let seed = 0

const uniqueId = () => {
  let currentSeed = 0

  do {
    currentSeed = Math.random() * 100000
  } while (currentSeed == seed)

  seed = currentSeed

  return Date.now() + seed
}

export default uniqueId
