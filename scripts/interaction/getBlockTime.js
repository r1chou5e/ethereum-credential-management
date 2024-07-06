const getBlockAverageTime = async () => {
  const span = 100;
  const times = [];
  const currentNumber = await web3.eth.getBlockNumber();
  const firstBlock = await web3.eth.getBlock(currentNumber - span);
  let prevTimestamp = firstBlock.timestamp;

  for (let i = currentNumber - span + 1; i <= currentNumber; i++) {
    const block = await web3.eth.getBlock(i);
    let time = block.timestamp - prevTimestamp;
    prevTimestamp = block.timestamp;
    times.push(time);
  }

  return Math.round(times.reduce((a, b) => a + b) / times.length);
};
