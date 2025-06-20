// 프레젠테이션 데이터
const presentationData = {
    cost_breakdown: {
        "서버 하드웨어": 1500,
        "NAS/SAN 스토리지": 300,
        "네트워크 장비": 150,
        "보안 장비": 250,
        "UPS 전원공급": 150,
        "랙 캐비닛": 150,
        "설치 구축": 500,
        "기타 부품": 500
    },
    products: [
        {name: "DAS", market_score: 8.5},
        {name: "Repeater", market_score: 7.8},
        {name: "O-RAN RU", market_score: 9.2},
        {name: "5G NR", market_score: 9.0}
    ],
    comparison: {
        "Zabbix": {score: 9, cost: "낮음", difficulty: "중간"},
        "DataDog": {score: 8.5, cost: "높음", difficulty: "낮음"},
        "Nagios": {score: 7, cost: "낮음", difficulty: "높음"},
        "PRTG": {score: 8, cost: "중간", difficulty: "낮음"}
    },
    tco_5years: {
        "제안안 On-premise": 4500,
        "클라우드 AWS": 12000,
        "최소구성": 3500
    }
};

// 글로벌 변수
let currentSlide = 1;
const totalSlides = 12;
let charts = {};

// DOM 요소
const slides = document.querySelectorAll('.slide');
const prevBtn = document.getElementById('prev-btn');
const nextBtn = document.getElementById('next-btn');
const currentSlideSpan = document.getElementById('current-slide');
const totalSlidesSpan = document.getElementById('total-slides');
const progressFill = document.querySelector('.progress-fill');

// 초기화
document.addEventListener('DOMContentLoaded', function() {
    // 총 슬라이드 수 표시
    totalSlidesSpan.textContent = totalSlides;
    
    // 이벤트 리스너 추가
    prevBtn.addEventListener('click', previousSlide);
    nextBtn.addEventListener('click', nextSlide);
    
    // 키보드 이벤트
    document.addEventListener('keydown', function(e) {
        if (e.key === 'ArrowLeft') {
            previousSlide();
        } else if (e.key === 'ArrowRight') {
            nextSlide();
        }
    });
    
    // 초기 상태 설정
    updateSlideDisplay();
    
    // 차트 초기화 (약간의 지연을 두고 실행)
    setTimeout(initializeCharts, 500);
});

// 슬라이드 이동 함수
function goToSlide(slideNumber) {
    if (slideNumber < 1 || slideNumber > totalSlides) return;
    
    // 현재 활성 슬라이드 비활성화
    slides[currentSlide - 1].classList.remove('active');
    
    // 새 슬라이드 활성화
    currentSlide = slideNumber;
    slides[currentSlide - 1].classList.add('active');
    
    updateSlideDisplay();
    
    // 해당 슬라이드의 차트가 있다면 다시 그리기
    setTimeout(() => {
        redrawChartsForCurrentSlide();
    }, 300);
}

function nextSlide() {
    if (currentSlide < totalSlides) {
        goToSlide(currentSlide + 1);
    }
}

function previousSlide() {
    if (currentSlide > 1) {
        goToSlide(currentSlide - 1);
    }
}

// UI 업데이트
function updateSlideDisplay() {
    // 슬라이드 카운터 업데이트
    currentSlideSpan.textContent = currentSlide;
    
    // 프로그레스 바 업데이트
    const progress = (currentSlide / totalSlides) * 100;
    progressFill.style.width = `${progress}%`;
    
    // 네비게이션 버튼 상태 업데이트
    prevBtn.disabled = currentSlide === 1;
    nextBtn.disabled = currentSlide === totalSlides;
}

// 차트 초기화
function initializeCharts() {
    createCostChart();
    createProductChart();
    createComparisonChart();
    createTCOChart();
}

// 현재 슬라이드의 차트 다시 그리기
function redrawChartsForCurrentSlide() {
    switch(currentSlide) {
        case 3:
            if (charts.costChart) {
                charts.costChart.destroy();
            }
            createCostChart();
            break;
        case 5:
            if (charts.productChart) {
                charts.productChart.destroy();
            }
            createProductChart();
            break;
        case 7:
            if (charts.comparisonChart) {
                charts.comparisonChart.destroy();
            }
            createComparisonChart();
            break;
        case 9:
            if (charts.tcoChart) {
                charts.tcoChart.destroy();
            }
            createTCOChart();
            break;
    }
}

// 비용 구성 파이 차트
function createCostChart() {
    const ctx = document.getElementById('costChart');
    if (!ctx) return;
    
    const labels = Object.keys(presentationData.cost_breakdown);
    const data = Object.values(presentationData.cost_breakdown);
    const colors = ['#1FB8CD', '#FFC185', '#B4413C', '#ECEBD5', '#5D878F', '#DB4545', '#D2BA4C', '#964325'];
    
    charts.costChart = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: colors,
                borderColor: '#ffffff',
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'right',
                    labels: {
                        padding: 20,
                        font: {
                            size: 12
                        }
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return context.label + ': ' + context.parsed + '만원';
                        }
                    }
                }
            }
        }
    });
}

// 제품 시장성 바 차트
function createProductChart() {
    const ctx = document.getElementById('productChart');
    if (!ctx) return;
    
    const labels = presentationData.products.map(p => p.name);
    const data = presentationData.products.map(p => p.market_score);
    const colors = ['#1FB8CD', '#FFC185', '#B4413C', '#5D878F'];
    
    charts.productChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: '시장성 점수',
                data: data,
                backgroundColor: colors,
                borderColor: colors,
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    max: 10,
                    ticks: {
                        font: {
                            size: 12
                        }
                    }
                },
                x: {
                    ticks: {
                        font: {
                            size: 12
                        }
                    }
                }
            },
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return '시장성: ' + context.parsed.y + '/10';
                        }
                    }
                }
            }
        }
    });
}

// 도구 비교 레이더 차트
function createComparisonChart() {
    const ctx = document.getElementById('comparisonChart');
    if (!ctx) return;
    
    const tools = Object.keys(presentationData.comparison);
    const scores = Object.values(presentationData.comparison).map(t => t.score);
    const colors = ['#1FB8CD', '#FFC185', '#B4413C', '#5D878F'];
    
    // 비용과 난이도를 점수로 변환
    const costScores = Object.values(presentationData.comparison).map(t => {
        switch(t.cost) {
            case '낮음': return 9;
            case '중간': return 6;
            case '높음': return 3;
            default: return 5;
        }
    });
    
    const difficultyScores = Object.values(presentationData.comparison).map(t => {
        switch(t.difficulty) {
            case '낮음': return 9;
            case '중간': return 6;
            case '높음': return 3;
            default: return 5;
        }
    });
    
    charts.comparisonChart = new Chart(ctx, {
        type: 'radar',
        data: {
            labels: ['기능성', '비용효율성', '사용편의성'],
            datasets: tools.map((tool, index) => ({
                label: tool,
                data: [scores[index], costScores[index], difficultyScores[index]],
                backgroundColor: colors[index] + '40',
                borderColor: colors[index],
                borderWidth: 2,
                pointBackgroundColor: colors[index],
                pointBorderColor: colors[index],
                pointRadius: 4
            }))
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                r: {
                    angleLines: {
                        display: true
                    },
                    suggestedMin: 0,
                    suggestedMax: 10,
                    ticks: {
                        font: {
                            size: 10
                        }
                    },
                    pointLabels: {
                        font: {
                            size: 12
                        }
                    }
                }
            },
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        padding: 20,
                        font: {
                            size: 12
                        }
                    }
                }
            }
        }
    });
}

// TCO 비교 컬럼 차트
function createTCOChart() {
    const ctx = document.getElementById('tcoChart');
    if (!ctx) return;
    
    const labels = Object.keys(presentationData.tco_5years);
    const data = Object.values(presentationData.tco_5years);
    const colors = ['#1FB8CD', '#FFC185', '#B4413C'];
    
    charts.tcoChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: '5년 TCO (백만원)',
                data: data,
                backgroundColor: colors,
                borderColor: colors,
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            indexAxis: 'y',
            scales: {
                x: {
                    beginAtZero: true,
                    ticks: {
                        font: {
                            size: 12
                        },
                        callback: function(value) {
                            return value + '백만원';
                        }
                    }
                },
                y: {
                    ticks: {
                        font: {
                            size: 12
                        }
                    }
                }
            },
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return '5년 TCO: ' + context.parsed.x + '백만원';
                        }
                    }
                }
            }
        }
    });
}

// 차트 정리 함수
function destroyAllCharts() {
    Object.values(charts).forEach(chart => {
        if (chart) {
            chart.destroy();
        }
    });
    charts = {};
}

// 페이지 언로드 시 차트 정리
window.addEventListener('beforeunload', destroyAllCharts);

// 터치 스와이프 지원 (모바일)
let touchStartX = 0;
let touchEndX = 0;

document.addEventListener('touchstart', function(e) {
    touchStartX = e.changedTouches[0].screenX;
});

document.addEventListener('touchend', function(e) {
    touchEndX = e.changedTouches[0].screenX;
    handleSwipe();
});

function handleSwipe() {
    const swipeThreshold = 50;
    const swipeDistance = touchEndX - touchStartX;
    
    if (Math.abs(swipeDistance) > swipeThreshold) {
        if (swipeDistance > 0) {
            // 오른쪽 스와이프 - 이전 슬라이드
            previousSlide();
        } else {
            // 왼쪽 스와이프 - 다음 슬라이드
            nextSlide();
        }
    }
}

// 프레젠테이션 자동 진행 기능 (옵션)
let autoPlayInterval = null;
let isAutoPlaying = false;

function startAutoPlay(intervalSeconds = 10) {
    if (isAutoPlaying) return;
    
    isAutoPlaying = true;
    autoPlayInterval = setInterval(() => {
        if (currentSlide < totalSlides) {
            nextSlide();
        } else {
            stopAutoPlay();
        }
    }, intervalSeconds * 1000);
}

function stopAutoPlay() {
    if (autoPlayInterval) {
        clearInterval(autoPlayInterval);
        autoPlayInterval = null;
        isAutoPlaying = false;
    }
}

// 스페이스바로 자동 진행 토글
document.addEventListener('keydown', function(e) {
    if (e.code === 'Space') {
        e.preventDefault();
        if (isAutoPlaying) {
            stopAutoPlay();
        } else {
            startAutoPlay(8);
        }
    }
});

// 풀스크린 지원
document.addEventListener('keydown', function(e) {
    if (e.key === 'F11' || (e.key === 'f' && e.ctrlKey)) {
        e.preventDefault();
        toggleFullscreen();
    }
});

function toggleFullscreen() {
    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(err => {
            console.log('풀스크린 모드 진입 실패:', err);
        });
    } else {
        document.exitFullscreen();
    }
}

// 마우스 클릭으로 슬라이드 이동
document.addEventListener('click', function(e) {
    // 네비게이션 버튼이나 다른 인터랙티브 요소가 아닌 경우에만
    if (!e.target.closest('.nav-btn') && !e.target.closest('.chart-container')) {
        const rect = document.documentElement.getBoundingClientRect();
        const clickX = e.clientX;
        const centerX = rect.width / 2;
        
        if (clickX < centerX) {
            previousSlide();
        } else {
            nextSlide();
        }
    }
});

// 페이지 가시성 변경 시 자동 진행 일시정지/재개
document.addEventListener('visibilitychange', function() {
    if (document.hidden && isAutoPlaying) {
        stopAutoPlay();
    }
});

// 리사이즈 이벤트 처리
window.addEventListener('resize', function() {
    // 차트 리사이즈
    Object.values(charts).forEach(chart => {
        if (chart) {
            chart.resize();
        }
    });
});

// 개발자 편의 기능 (개발 모드에서만)
if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    // 숫자 키로 슬라이드 이동
    document.addEventListener('keydown', function(e) {
        const num = parseInt(e.key);
        if (num >= 1 && num <= 9 && num <= totalSlides) {
            goToSlide(num);
        }
    });
    
    console.log('프레젠테이션 개발 모드');
    console.log('사용 가능한 키보드 단축키:');
    console.log('← / → : 슬라이드 이동');
    console.log('1-9 : 직접 슬라이드 이동');
    console.log('Space : 자동 진행 토글');
    console.log('F11 : 풀스크린 토글');
}