document.addEventListener('DOMContentLoaded', () => {
    // 게임 상태 관리
    const gameState = {
        chandelierComplete: false,
        deskComplete: false,
        candlestickComplete: false,
        hints: {
            first: null,
            second: null,
            third_fourth: null
        }
    };

    // 모달 관련 요소
    const modal = document.getElementById('modal');
    const modalTitle = document.getElementById('modal-title');
    const modalGameArea = document.getElementById('modal-game-area');
    const modalMessageArea = document.getElementById('modal-message-area');
    const closeModalButton = document.getElementById('modal-close-button');

    // 오브젝트 클릭 이벤트 리스너 설정
    document.getElementById('chandelier').addEventListener('click', () => {
        if (!gameState.chandelierComplete) {
            openChandelierGame();
        } else {
            showCompletedMessage("샹들리에의 불빛은 더 이상 새로운 것을 보여주지 않습니다.");
        }
    });

    document.getElementById('desk').addEventListener('click', () => {
        if (!gameState.deskComplete) {
            openDeskGame();
        } else {
            showCompletedMessage("부서진 책상은 이미 모든 비밀을 말해주었습니다.");
        }
    });

    document.getElementById('candlestick').addEventListener('click', () => {
        if (!gameState.candlestickComplete) {
            openCandlestickGame();
        } else {
            showCompletedMessage("촛불은 이미 진실을 밝혔습니다.");
        }
    });
    
    document.getElementById('door').addEventListener('click', openDoorLock);

    // 모달 닫기 버튼
    closeModalButton.addEventListener('click', () => {
        modal.classList.add('modal-hidden');
    });

    // 공통 함수: 이미 완료된 게임 메시지 표시
    function showCompletedMessage(message) {
        modalTitle.textContent = "알림";
        modalGameArea.innerHTML = "";
        modalMessageArea.innerHTML = `<p>${message}</p>`;
        modal.classList.remove('modal-hidden');
    }

    // 1. 샹들리에 게임
    function openChandelierGame() {
        modalTitle.textContent = "빛의 순서를 기억하라";
        modalGameArea.innerHTML = `
            <p>보석이 깜박이는 순서를 기억하고 그대로 클릭하세요.</p>
            <div id="gem-container">
                <div class="gem" data-color="red" style="background-color: red;"></div>
                <div class="gem" data-color="blue" style="background-color: blue;"></div>
                <div class="gem" data-color="green" style="background-color: green;"></div>
                <div class="gem" data-color="yellow" style="background-color: yellow;"></div>
                <div class="gem" data-color="purple" style="background-color: purple;"></div>
            </div>
            <button id="start-gem-game">시작</button>
        `;
        modalMessageArea.innerHTML = "";
        modal.classList.remove('modal-hidden');

        const gems = Array.from(document.querySelectorAll('.gem'));
        const colors = ["red", "blue", "green", "yellow", "purple"];
        let sequence = [];
        let playerSequence = [];
        let level = 1;

        document.getElementById('start-gem-game').addEventListener('click', (e) => {
            e.target.style.display = 'none';
            playSequence();
        });

        gems.forEach(gem => {
            gem.addEventListener('click', () => {
                const color = gem.dataset.color;
                playerSequence.push(color);
                flash(gem, 300);

                if (playerSequence.length === sequence.length) {
                    checkSequence();
                }
            });
        });

        function playSequence() {
            playerSequence = [];
            if (level === 1) sequence = getRandomColors(3);
            else if (level === 2) sequence = getRandomColors(4);
            else if (level === 3) sequence = getRandomColors(5);
            
            let i = 0;
            const interval = setInterval(() => {
                if (i < sequence.length) {
                    const gemToFlash = document.querySelector(`.gem[data-color="${sequence[i]}"]`);
                    flash(gemToFlash, 500);
                    i++;
                } else {
                    clearInterval(interval);
                }
            }, 800);
        }

        function checkSequence() {
            if (JSON.stringify(playerSequence) === JSON.stringify(sequence)) {
                level++;
                if (level > 3) {
                    modalMessageArea.innerHTML = `<p style="color:green; font-weight:bold;">성공! 힌트를 획득했습니다.</p><p><strong>힌트:</strong> 오래된 달력의 두 번째 숫자가 비밀번호의 첫 번째 자리를 알려준다.</p>`;
                    gameState.chandelierComplete = true;
                    gameState.hints.first = "오래된 달력의 두 번째 숫자가 비밀번호의 첫 번째 자리를 알려준다.";
                } else {
                    modalMessageArea.innerHTML = `<p style="color:blue;">성공! 다음 단계를 준비하세요. (${level}/3)</p>`;
                    setTimeout(playSequence, 1500);
                }
            } else {
                modalMessageArea.innerHTML = `<p style="color:red;">실패! 다시 시도하세요.</p>`;
                level = 1;
                document.getElementById('start-gem-game').style.display = 'inline-block';
            }
        }

        function getRandomColors(num) {
            const shuffled = [...colors].sort(() => 0.5 - Math.random());
            return shuffled.slice(0, num);
        }

        function flash(element, duration) {
            const originalColor = element.style.borderColor;
            element.style.borderColor = 'gold';
            setTimeout(() => {
                element.style.borderColor = originalColor;
            }, duration);
        }
    }

    // 2. 책상 게임
    function openDeskGame() {
        modalTitle.textContent = "찢어진 달력 조각 맞추기";
        modalGameArea.innerHTML = `
            <p>아래 조각들을 드래그하여 위쪽의 달력판을 완성하세요.</p>
            <div id="calendar-dropzone"></div>
            <div id="calendar-pieces">
                <div class="calendar-piece" draggable="true" id="piece1">8월 2일</div>
                <div class="calendar-piece" draggable="true" id="piece4">19일</div>
                <div class="calendar-piece" draggable="true" id="piece3">달력</div>
                <div class="calendar-piece" draggable="true" id="piece2" style="color:red; font-weight:bold; font-size: 24px;">[ 2 ]</div>
            </div>
        `;
        modalMessageArea.innerHTML = "";
        modal.classList.remove('modal-hidden');

        const pieces = document.querySelectorAll('.calendar-piece');
        const dropzone = document.getElementById('calendar-dropzone');
        let draggedItem = null;

        pieces.forEach(piece => {
            piece.addEventListener('dragstart', (e) => {
                draggedItem = e.target;
                setTimeout(() => e.target.style.display = 'none', 0);
            });
            piece.addEventListener('dragend', (e) => {
                setTimeout(() => {
                    draggedItem.style.display = 'block';
                    draggedItem = null;
                }, 0);
            });
        });
        
        dropzone.addEventListener('dragover', e => e.preventDefault());
        dropzone.addEventListener('dragenter', e => e.preventDefault());
        
        dropzone.addEventListener('drop', (e) => {
            if (draggedItem) {
                e.target.append(draggedItem);
                checkCalendarCompletion();
            }
        });
        
        function checkCalendarCompletion() {
            if (dropzone.children.length === 4) {
                 modalMessageArea.innerHTML = `<p style="color:green; font-weight:bold;">성공! 붉은 원 안의 숫자를 발견했습니다.</p><p><strong>힌트:</strong> 첫 번째 비밀번호는 <strong>2</strong>이다.</p>`;
                 gameState.deskComplete = true;
                 gameState.hints.first = "첫 번째 비밀번호는 2이다.";
            }
        }
    }
    
    // 3. 촛대 게임
    function openCandlestickGame() {
        modalTitle.textContent = "올바른 초에 불을 밝혀라";
        modalGameArea.innerHTML = `
            <p>계산 결과가 '0'이 되는 초에만 불을 붙이세요. (초를 클릭하면 불이 붙습니다)</p>
            <div id="candle-container">
                <div class="candle" data-answer="not-zero"><p>3+1-2</p></div>
                <div class="candle" data-answer="zero"><p>5-3-2</p></div>
                <div class="candle" data-answer="not-zero"><p>1+1</p></div>
                <div class="candle" data-answer="not-zero"><p>9-5</p></div>
                <div class="candle" data-answer="not-zero"><p>2*3-5</p></div>
            </div>
            <button id="check-candles">확인하기</button>
        `;
        modalMessageArea.innerHTML = "";
        modal.classList.remove('modal-hidden');

        const candles = document.querySelectorAll('.candle');
        candles.forEach(candle => {
            candle.addEventListener('click', () => {
                candle.classList.toggle('lit');
            });
        });

        document.getElementById('check-candles').addEventListener('click', () => {
            let correct = true;
            candles.forEach(candle => {
                const isLit = candle.classList.contains('lit');
                const shouldBeLit = candle.dataset.answer === 'zero';
                if (isLit !== shouldBeLit) {
                    correct = false;
                }
            });

            if (correct) {
                modalMessageArea.innerHTML = `<p style="color:green; font-weight:bold;">성공! 힌트를 획득했습니다.</p><p><strong>힌트:</strong> 두 번째 비밀번호는 <strong>0</strong>이다.</p>`;
                gameState.candlestickComplete = true;
                gameState.hints.second = "두 번째 비밀번호는 0이다.";
            } else {
                modalMessageArea.innerHTML = `<p style="color:red;">실패! 무언가 잘못되었습니다. 불을 다시 조정하세요.</p>`;
            }
        });
    }

    // 4. 문 자물쇠
    function openDoorLock() {
        modalTitle.textContent = "비밀번호를 입력하라";
        modalGameArea.innerHTML = `
            <div id="password-input-area">
                <input type="text" maxlength="1" id="pw1">
                <input type="text" maxlength="1" id="pw2">
                <input type="text" maxlength="1" id="pw3">
                <input type="text" maxlength="1" id="pw4">
            </div>
            <button id="submit-password">탈출 시도</button>
            <div id="password-hints">
                <h4>획득한 힌트</h4>
            </div>
        `;
        modalMessageArea.innerHTML = "";

        // 힌트 업데이트
        const hintsContainer = document.getElementById('password-hints');
        hintsContainer.innerHTML += gameState.hints.first ? `<p>• ${gameState.hints.first}</p>` : '<p>• 첫 번째 힌트: ???</p>';
        hintsContainer.innerHTML += gameState.hints.second ? `<p>• ${gameState.hints.second}</p>` : '<p>• 두 번째 힌트: ???</p>';
        
        // 모든 게임 완료 시 마지막 힌트 공개
        if (gameState.chandelierComplete && gameState.deskComplete && gameState.candlestickComplete) {
            gameState.hints.third_fourth = "마지막 두 자리는 문 명패에 새겨진 연도의 끝 두 자리이다.";
        }
        hintsContainer.innerHTML += gameState.hints.third_fourth ? `<p>• ${gameState.hints.third_fourth}</p>` : '<p>• 마지막 힌트: ???</p>';
        
        modal.classList.remove('modal-hidden');

        document.getElementById('submit-password').addEventListener('click', () => {
            const pw1 = document.getElementById('pw1').value;
            const pw2 = document.getElementById('pw2').value;
            const pw3 = document.getElementById('pw3').value;
            const pw4 = document.getElementById('pw4').value;
            const fullPassword = `${pw1}${pw2}${pw3}${pw4}`;

            if (fullPassword === "2025") {
                modalGameArea.innerHTML = "";
                modalMessageArea.innerHTML = `<h1 style="color:gold;">탈출 성공!</h1><p>육중한 철문이 열리며 당신은 마침내 잊혀진 서재에서 벗어났습니다.</p>`;
                closeModalButton.textContent = "게임 종료";
            } else {
                modalMessageArea.innerHTML = `<p style="color:red;">비밀번호가 틀렸습니다. 덜컹거리는 소리만 들릴 뿐입니다.</p>`;
            }
        });
    }
});