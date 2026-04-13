const fs = require('fs');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// 1. 데이터 불러오기
const rawData = JSON.parse(fs.readFileSync('./subway_final.json', 'utf-8'));
const allLines = [...new Set(rawData.map(item => item.line))].sort();

// 지연 시간을 만드는 헬퍼 함수
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function startProgram() {
  console.clear();
  console.log("🚇 수도권 지하철 랜덤 추천 프로그램");
  console.log("--------------------------------");
  
  allLines.forEach((line, index) => {
    process.stdout.write(`[${index + 1}] ${line.padEnd(10)}`);
    if ((index + 1) % 4 === 0) console.log(""); 
  });
  
  console.log("\n--------------------------------");

  // 2. 제외 호선 입력
  rl.question('❌ 제외하고 싶은 호선의 번호를 입력하세요 (쉼표 구분, 없으면 엔터): ', async (input) => {
    const excludedIndices = input.split(',').map(i => parseInt(i.trim()) - 1);
    const excludedLines = excludedIndices
      .filter(i => i >= 0 && i < allLines.length)
      .map(i => allLines[i]);

    const availableLines = allLines.filter(line => !excludedLines.includes(line));

    if (availableLines.length === 0) {
      console.log("⚠️ 모든 호선이 제외되었습니다. 처음부터 다시 시작합니다.");
      await sleep(1500);
      return startProgram();
    }

    await runRandomPick(availableLines);
  });
}

// 3. 랜덤 추출 및 연출 로직
async function runRandomPick(availableLines) {
  console.log("\n🎲 먼저 호선을 뽑습니다...");
  await sleep(1000);

  const selectedLine = availableLines[Math.floor(Math.random() * availableLines.length)];
  console.log(`▶️ 선택된 호선: [${selectedLine}]`);
  
  console.log("🔍 이제 역을 찾는 중...");
  await sleep(1500);

  const stationsInLine = rawData.filter(item => item.line === selectedLine);
  const selectedStation = stationsInLine[Math.floor(Math.random() * stationsInLine.length)];

  console.log("\n================================");
  console.log(`🎯 최종 목적지: ${selectedStation.station}역`);
  console.log("================================\n");

  askRetry(availableLines);
}

// 4. 다시 뽑기 기능
function askRetry(availableLines) {
  rl.question('🔄 다시 뽑으시겠습니까? (y: 다시 뽑기 / n: 종료 / r: 호선 재선택): ', async (answer) => {
    const choice = answer.toLowerCase();
    if (choice === 'y') {
      await runRandomPick(availableLines); // 현재 필터링 유지하며 다시 뽑기
    } else if (choice === 'r') {
      startProgram(); // 처음으로 돌아가서 호선부터 다시 선택
    } else {
      console.log("👋 프로그램을 종료합니다. 즐거운 여행 되세요!");
      rl.close();
    }
  });
}

// 프로그램 시작
startProgram();