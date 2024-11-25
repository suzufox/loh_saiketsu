// プレイヤーデータとマッチデータを保持する配列
let players = [];
let matches = [];

// 各プレイヤーの選択された車の順位を保持するオブジェクト
let selectedPositions = {
    A: [null, null, null],
    B: [null, null, null]
};

// ページ読み込み時にLocalStorageからデータを取得
window.onload = function() {
    if (localStorage.getItem('players')) {
        players = JSON.parse(localStorage.getItem('players'));
    }
    if (localStorage.getItem('matches')) {
        matches = JSON.parse(localStorage.getItem('matches'));
    }
    updatePlayerSearch();
    updateDaySearch();
    populatePlayerSelects();
    setupCarPositionButtons();
    updateRankingTable();
    updateDailyRankings();
    updateMatchesTable();
    setupUserRegistration();
    setupToggleDailyRankings();
    setupSearchFilters(); // 検索フィルターのセットアップを追加
}

// ユーザー登録フォームのセットアップ
function setupUserRegistration() {
    const userForm = document.getElementById('user-form');
    if (userForm) {
        userForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const userNameInput = document.getElementById('user-name');
            const userName = userNameInput.value.trim();
            if (userName === '') {
                alert('ユーザー名を入力してください。');
                return;
            }
            if (players.find(p => p.name === userName)) {
                alert('このユーザーは既に登録されています。');
                return;
            }
            const newUser = {
                name: userName,
                wins: 0,
                losses: 0,
                totalPoints: 0,
                matches: 0
            };
            players.push(newUser);
            saveData();
            populatePlayerSelects();
            userNameInput.value = '';
            alert(`ユーザー「${userName}」を登録しました。`);
        });
    }
}

// プレイヤー名のセレクトボックスを更新
function populatePlayerSelects() {
    const playerASelect = document.getElementById('player-a-name');
    const playerBSelect = document.getElementById('player-b-name');

    if (playerASelect && playerBSelect) {
        // 一旦全てのオプションをクリア
        playerASelect.innerHTML = '<option value="">選択してください</option>';
        playerBSelect.innerHTML = '<option value="">選択してください</option>';

        players.forEach(player => {
            const optionA = document.createElement('option');
            optionA.value = player.name;
            optionA.textContent = player.name;
            playerASelect.appendChild(optionA);

            const optionB = document.createElement('option');
            optionB.value = player.name;
            optionB.textContent = player.name;
            playerBSelect.appendChild(optionB);
        });
    }
}

// プレイヤー検索セレクトボックスの更新
function updatePlayerSearch() {
    const playerSearch = document.getElementById('player-search');
    if (playerSearch) {
        playerSearch.innerHTML = '<option value="">全てのプレイヤー</option>';
        players.forEach(player => {
            const option = document.createElement('option');
            option.value = player.name;
            option.textContent = player.name;
            playerSearch.appendChild(option);
        });
    }
}

// 日付検索セレクトボックスの更新
function updateDaySearch() {
    const daySearch = document.getElementById('day-search');
    if (daySearch) {
        // 必要に応じて日付のオプションを追加
    }
}

// ウマ娘順位選択ボタンのセットアップ
function setupCarPositionButtons() {
    // プレイヤーAのウマ娘
    setupSingleCarPositionButtons('A', 0, 'a-car1-buttons');
    setupSingleCarPositionButtons('A', 1, 'a-car2-buttons');
    setupSingleCarPositionButtons('A', 2, 'a-car3-buttons');

    // プレイヤーBのウマ娘
    setupSingleCarPositionButtons('B', 0, 'b-car1-buttons');
    setupSingleCarPositionButtons('B', 1, 'b-car2-buttons');
    setupSingleCarPositionButtons('B', 2, 'b-car3-buttons');
}

// 各ウマ娘順位選択ボタンのセットアップ関数
function setupSingleCarPositionButtons(playerType, carIndex, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    for (let i = 1; i <= 6; i++) {
        const button = document.createElement('button');
        button.type = 'button';
        button.textContent = i;
        button.classList.add('position-button');
        button.dataset.position = i;
        button.addEventListener('click', function() {
            handlePositionSelection(playerType, carIndex, i, containerId);
        });
        container.appendChild(button);
    }
}

// ウマ娘順位選択時の処理
function handlePositionSelection(playerType, carIndex, position, containerId) {
    // 既に同じ順位が選択されていないか確認
    if (selectedPositions[playerType].includes(position)) {
        alert('同じプレイヤー内で同じ順位を選択することはできません。');
        return;
    }

    // 位置を割り当て
    selectedPositions[playerType][carIndex] = position;
    updatePositionButtons(playerType, carIndex, containerId);
}

// ウマ娘順位選択ボタンの更新
function updatePositionButtons(playerType, carIndex, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    const buttons = container.querySelectorAll('button.position-button');
    buttons.forEach(button => {
        const pos = parseInt(button.dataset.position);
        if (selectedPositions[playerType][carIndex] === pos) {
            button.classList.add('selected');
        } else {
            button.classList.remove('selected');
        }

        // 同じプレイヤー内で既に選択されている順位は無効化
        if (selectedPositions[playerType].includes(pos) && selectedPositions[playerType][carIndex] !== pos) {
            button.disabled = true;
        } else {
            button.disabled = false;
        }
    });

    // 選択された順位を表示
    const displaySpan = document.getElementById(`${playerType}-car${carIndex + 1}-selected`);
    if (displaySpan) {
        displaySpan.textContent = selectedPositions[playerType][carIndex] ? `選択済み: ${selectedPositions[playerType][carIndex]}` : '未選択';
    }
}

// フォームの送信イベント
document.getElementById('match-form').addEventListener('submit', function(e) {
    e.preventDefault();

    // プレイヤーの選択を取得
    const playerASelect = document.getElementById('player-a-name');
    const playerBSelect = document.getElementById('player-b-name');
    const playerAName = playerASelect.value;
    const playerBName = playerBSelect.value;

    if (playerAName === '' || playerBName === '') {
        alert('プレイヤーAとプレイヤーBを選択してください。');
        return;
    }

    if (playerAName === playerBName) {
        alert('プレイヤーAとプレイヤーBは異なるユーザーを選択してください。');
        return;
    }

    // 部屋名の取得と日付の抽出
    const roomNameInput = document.getElementById('room-name');
    const roomName = roomNameInput.value.trim();

    // 日付を抽出
    let day = parseInt(roomName.charAt(0), 10);
    if (isNaN(day) || day < 1 || day > 4) {
        alert('部屋名の最初の文字から日付を取得できませんでした。1-4の日付を表す数字が必要です。');
        return;
    }

    // プレイヤーAとBの順位を取得
    const aPositions = selectedPositions.A;
    const bPositions = selectedPositions.B;

    if (aPositions.includes(null) || bPositions.includes(null)) {
        alert('プレイヤーAとBの全ての順位を選択してください。');
        return;
    }

    // ポイント計算
    const aPoints = calculatePoints(aPositions);
    const bPoints = calculatePoints(bPositions);

    // 勝者の判定
    let winner, loser;
    if (aPoints > bPoints) {
        winner = players.find(p => p.name === playerAName);
        loser = players.find(p => p.name === playerBName);
    } else if (bPoints > aPoints) {
        winner = players.find(p => p.name === playerBName);
        loser = players.find(p => p.name === playerAName);
    } else {
        alert('引き分けです。勝者を決定してください。');
        return;
    }

    // プレイヤーの勝敗とポイントの更新
    winner.wins += 1;
    winner.totalPoints += (winner.name === playerAName) ? aPoints : bPoints;
    winner.matches +=1;

    loser.losses += 1;
    loser.totalPoints += (loser.name === playerAName) ? aPoints : bPoints;
    loser.matches +=1;

    // マッチデータの作成
    const match = {
        id: Date.now(),
        roomName: roomName,
        day: day,
        playerAName: playerAName,
        playerBName: playerBName,
        playerAPoints: aPoints,
        playerBPoints: bPoints,
        winnerName: winner.name
    };
    matches.push(match);

    // データの保存
    saveData();

    // テーブルの更新
    updateRankingTable();
    updateDailyRankings();
    updateMatchesTable();

    // フォームのリセット
    document.getElementById('match-form').reset();
    resetSelectedPositions();
    resetPositionDisplays();
});

// ポイント計算の関数
function calculatePoints(positions) {
    let points = 0;
    positions.forEach(pos => {
        switch(pos) {
            case 1:
                points += 100;
                break;
            case 2:
                points += 60;
                break;
            case 3:
                points += 40;
                break;
            case 4:
                points += 20;
                break;
            case 5:
                points += 10;
                break;
            default:
                points += 0;
        }
    });
    return points;
}

// データをLocalStorageに保存
function saveData() {
    localStorage.setItem('players', JSON.stringify(players));
    localStorage.setItem('matches', JSON.stringify(matches));
    updatePlayerSearch(); // プレイヤー名のリストを更新
    populatePlayerSelects(); // プレイヤーセレクトを更新
}

// 総合ランキングテーブルの更新
function updateRankingTable() {
    // 勝数でソートし、同じ勝数の場合は総合ポイントでソート
    players.sort((a, b) => {
        if (b.wins === a.wins) {
            return b.totalPoints - a.totalPoints;
        }
        return b.wins - a.wins;
    });
    const tbody = document.querySelector('#ranking-table tbody');
    tbody.innerHTML = '';
    players.forEach((player, index) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${index + 1}</td>
            <td>${player.name}</td>
            <td>${player.wins}</td>
            <td>${player.losses}</td>
            <td>${player.matches}</td>
            <td>${player.totalPoints}</td>
            <td>
                <button class="delete-button" onclick="deletePlayer('${player.name}')">削除</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

// 各日のランキングテーブルの更新
function updateDailyRankings() {
    const dailyRankingsContainer = document.getElementById('daily-rankings');
    dailyRankingsContainer.innerHTML = ''; // 既存のランキングをクリア

    for (let day = 1; day <= 4; day++) {
        // 該当日のマッチを取得
        const dayMatches = matches.filter(match => match.day === day);

        if (dayMatches.length === 0) continue; // 該当日のマッチがない場合はスキップ

        // 当日のプレイヤーデータを計算
        let dayPlayers = {};

        dayMatches.forEach(match => {
            // プレイヤーA
            if (!dayPlayers[match.playerAName]) {
                dayPlayers[match.playerAName] = { name: match.playerAName, wins: 0, losses: 0, totalPoints: 0, matches: 0 };
            }
            dayPlayers[match.playerAName].totalPoints += match.playerAPoints;
            dayPlayers[match.playerAName].matches +=1;

            // プレイヤーB
            if (!dayPlayers[match.playerBName]) {
                dayPlayers[match.playerBName] = { name: match.playerBName, wins: 0, losses: 0, totalPoints: 0, matches: 0 };
            }
            dayPlayers[match.playerBName].totalPoints += match.playerBPoints;
            dayPlayers[match.playerBName].matches +=1;

            // 勝敗の更新
            if (match.winnerName === match.playerAName) {
                dayPlayers[match.playerAName].wins +=1;
                dayPlayers[match.playerBName].losses +=1;
            } else {
                dayPlayers[match.playerBName].wins +=1;
                dayPlayers[match.playerAName].losses +=1;
            }
        });

        // プレイヤーリストに変換
        const dayPlayerList = Object.values(dayPlayers);

        // 勝数でソートし、同じ勝数の場合は総合ポイントでソート
        dayPlayerList.sort((a, b) => {
            if (b.wins === a.wins) {
                return b.totalPoints - a.totalPoints;
            }
            return b.wins - a.wins;
        });

        // ランキングテーブルの作成
        const table = document.createElement('table');
        table.classList.add('daily-ranking-table');
        table.innerHTML = `
            <thead>
                <tr>
                    <th>順位</th>
                    <th>名義</th>
                    <th>勝数</th>
                    <th>敗数</th>
                    <th>総対戦数</th>
                    <th>総合ポイント</th>
                </tr>
            </thead>
            <tbody>
                ${dayPlayerList.map((player, index) => `
                    <tr>
                        <td>${index + 1}</td>
                        <td>${player.name}</td>
                        <td>${player.wins}</td>
                        <td>${player.losses}</td>
                        <td>${player.matches}</td>
                        <td>${player.totalPoints}</td>
                    </tr>
                `).join('')}
            </tbody>
        `;

        // 日付の見出しを追加（クリックで開閉可能）
        const dayHeading = document.createElement('h3');
        dayHeading.textContent = `${day}日目のランキング表`;
        dayHeading.style.cursor = 'pointer';
        dayHeading.style.userSelect = 'none';
        dayHeading.addEventListener('click', function() {
            table.classList.toggle('hidden');
        });

        // セクションに追加
        dailyRankingsContainer.appendChild(dayHeading);
        dailyRankingsContainer.appendChild(table);
    }
}

// マッチテーブルの更新
function updateMatchesTable() {
    // 部屋名でソート（自然順）
    matches.sort((a, b) => a.roomName.localeCompare(b.roomName, undefined, { numeric: true, sensitivity: 'base' }));

    const tbody = document.querySelector('#matches-table tbody');
    tbody.innerHTML = '';

    // 選択されたプレイヤー名と日付を取得
    const selectedPlayer = document.getElementById('player-search').value;
    const selectedDay = document.getElementById('day-search').value;

    matches.forEach(match => {
        // フィルタリング
        const matchesPlayer = selectedPlayer === '' || match.playerAName === selectedPlayer || match.playerBName === selectedPlayer;
        const matchesDay = selectedDay === '' || match.day.toString() === selectedDay;

        if (matchesPlayer && matchesDay) {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${match.roomName}</td>
                <td>${match.playerAName}</td>
                <td>${match.playerBName}</td>
                <td>${match.playerAPoints}</td>
                <td>${match.playerBPoints}</td>
                <td>${match.winnerName}</td>
                <td>
                    <button class="edit-button" onclick="editMatch(${match.id})">編集</button>
                    <button class="delete-button" onclick="deleteMatch(${match.id})">削除</button>
                </td>
            `;
            tbody.appendChild(tr);
        }
    });
}

// プレイヤーを削除する関数
function deletePlayer(name) {
    if (confirm(`${name} を削除しますか？このプレイヤーに関連する全ての対戦結果も削除されます。`)) {
        // プレイヤーの削除
        players = players.filter(p => p.name !== name);

        // 関連するマッチの削除と対戦相手のデータ更新
        const relatedMatches = matches.filter(match => match.playerAName === name || match.playerBName === name);
        relatedMatches.forEach(match => {
            const opponentName = match.playerAName === name ? match.playerBName : match.playerAName;
            const opponent = players.find(p => p.name === opponentName);
            if (opponent) {
                opponent.matches -=1;
                opponent.totalPoints -= (opponentName === match.playerAName) ? match.playerAPoints : match.playerBPoints;
                if (match.winnerName === opponentName) {
                    opponent.wins -=1;
                } else {
                    opponent.losses -=1;
                }
            }
        });

        // マッチを削除
        matches = matches.filter(match => match.playerAName !== name && match.playerBName !== name);

        // データの保存と更新
        saveData();
        updateRankingTable();
        updateDailyRankings();
        updateMatchesTable();
        populatePlayerSelects(); // プレイヤーセレクトを更新
    }
}

// マッチを削除する関数
function deleteMatch(id) {
    if (confirm('この対戦結果を削除しますか？')) {
        // マッチデータの削除
        const matchIndex = matches.findIndex(m => m.id === id);
        if (matchIndex === -1) return;
        const match = matches[matchIndex];
        matches.splice(matchIndex, 1);

        // プレイヤーデータの更新
        const playerA = players.find(p => p.name === match.playerAName);
        const playerB = players.find(p => p.name === match.playerBName);

        if (playerA && playerB) {
            if (match.winnerName === playerA.name) {
                playerA.wins -= 1;
                playerB.losses -= 1;
            } else {
                playerB.wins -= 1;
                playerA.losses -= 1;
            }
            playerA.totalPoints -= match.playerAPoints;
            playerB.totalPoints -= match.playerBPoints;
            playerA.matches -=1;
            playerB.matches -=1;
        }

        // データの保存と更新
        saveData();
        updateRankingTable();
        updateDailyRankings();
        updateMatchesTable();
    }
}

// マッチを編集する関数
function editMatch(id) {
    const match = matches.find(m => m.id === id);
    if (!match) return;

    // フォームにデータをセット
    const roomNameInput = document.getElementById('room-name');
    const playerASelect = document.getElementById('player-a-name');
    const playerBSelect = document.getElementById('player-b-name');

    if (!roomNameInput || !playerASelect || !playerBSelect) return;

    roomNameInput.value = match.roomName;
    playerASelect.value = match.playerAName;
    playerBSelect.value = match.playerBName;

    // 選択をリセット
    resetSelectedPositions();
    resetPositionDisplays();

    // ボタンの状態を更新
    updatePositionButtons('A', 0, 'a-car1-buttons');
    updatePositionButtons('A', 1, 'a-car2-buttons');
    updatePositionButtons('A', 2, 'a-car3-buttons');
    updatePositionButtons('B', 0, 'b-car1-buttons');
    updatePositionButtons('B', 1, 'b-car2-buttons');
    updatePositionButtons('B', 2, 'b-car3-buttons');

    // マッチを削除
    matches = matches.filter(m => m.id !== id);

    // プレイヤーデータの更新
    const playerA = players.find(p => p.name === match.playerAName);
    const playerB = players.find(p => p.name === match.playerBName);

    if (playerA && playerB) {
        if (match.winnerName === match.playerAName) {
            playerA.wins -= 1;
            playerB.losses -= 1;
        } else {
            playerB.wins -= 1;
            playerA.losses -= 1;
        }
        playerA.totalPoints -= match.playerAPoints;
        playerB.totalPoints -= match.playerBPoints;
        playerA.matches -=1;
        playerB.matches -=1;
    }

    // データの保存と更新
    saveData();
    updateRankingTable();
    updateDailyRankings();
    updateMatchesTable();
}

// 位置選択をリセットする関数
function resetSelectedPositions() {
    selectedPositions.A = [null, null, null];
    selectedPositions.B = [null, null, null];
}

// 位置表示をリセットする関数
function resetPositionDisplays() {
    const aDisplay1 = document.getElementById('A-car1-selected');
    const aDisplay2 = document.getElementById('A-car2-selected');
    const aDisplay3 = document.getElementById('A-car3-selected');
    const bDisplay1 = document.getElementById('B-car1-selected');
    const bDisplay2 = document.getElementById('B-car2-selected');
    const bDisplay3 = document.getElementById('B-car3-selected');

    if (aDisplay1) aDisplay1.textContent = '未選択';
    if (aDisplay2) aDisplay2.textContent = '未選択';
    if (aDisplay3) aDisplay3.textContent = '未選択';
    if (bDisplay1) bDisplay1.textContent = '未選択';
    if (bDisplay2) bDisplay2.textContent = '未選択';
    if (bDisplay3) bDisplay3.textContent = '未選択';
}

// 各日のランキングの開閉をセットアップ
function setupToggleDailyRankings() {
    const dailyRankingsContainer = document.getElementById('daily-rankings');
    if (!dailyRankingsContainer) return;

    const headings = dailyRankingsContainer.querySelectorAll('h3');
    headings.forEach(heading => {
        heading.style.cursor = 'pointer';
        heading.style.userSelect = 'none';
        heading.addEventListener('click', function() {
            const nextSibling = heading.nextElementSibling;
            if (nextSibling) {
                nextSibling.classList.toggle('hidden');
            }
        });
    });
}

// 検索フィルターのセットアップ
function setupSearchFilters() {
    const playerSearch = document.getElementById('player-search');
    const daySearch = document.getElementById('day-search');

    if (playerSearch) {
        playerSearch.addEventListener('change', updateMatchesTable);
    }

    if (daySearch) {
        daySearch.addEventListener('change', updateMatchesTable);
    }
}
