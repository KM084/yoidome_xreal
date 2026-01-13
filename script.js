// --- Mock Data & State ---
let records = JSON.parse(localStorage.getItem('sukkiri_records_v4')) || [
    { id: 1, date: '2025-11-10 08:30', type: 'car', sickness: 60, weather: 'rain', note: '湿気が多くて空気が重かった。', hasVideo: false, hasImage: true, isIncomplete: false, isConsulted: false, imageSrc: './image/Generated Image December 08, 2025 - 1_45PM (1).png' },
    { id: 2, date: '2025-11-12 10:00', type: 'car', sickness: 10, weather: 'sunny', note: '換気をこまめにしたので快適。', hasVideo: false, hasImage: false, isIncomplete: false, isConsulted: false },
    { id: 3, date: '2025-11-15 14:00', type: 'bus', sickness: 5, weather: 'sunny', note: '', hasVideo: true, hasImage: false, isIncomplete: false, isConsulted: false, videoSrc: './video/Generated File December 08, 2025 - 1_50PM (1).mp4' },
    { id: 4, date: '2025-11-16 18:30', type: 'car', sickness: 75, weather: 'cloudy', note: '仕事帰りで疲れていたせいかも。', hasVideo: false, hasImage: true, isIncomplete: false, isConsulted: false, imageSrc: './image/Generated Image December 08, 2025 - 1_45PM.png' },
    { id: 5, date: '2025-11-20 09:00', type: 'car', sickness: 95, weather: 'rain', note: '目が回ってしまいすぐに限界がきた。', hasVideo: true, hasImage: false, isIncomplete: false, isConsulted: false, videoSrc: './video/Generated File December 08, 2025 - 1_50PM.mp4' },
    { id: 6, date: '2025-11-29 16:00', type: 'pending', sickness: 45, weather: 'sunny', note: '', hasVideo: false, hasImage: false, isIncomplete: true, isConsulted: false }
];

let lastTransport = localStorage.getItem('sukkiri_last_transport') || 'car';
let userProfile = JSON.parse(localStorage.getItem('sukkiri_profile_v1')) || null;
let chatSession = [];
let aiInsights = JSON.parse(localStorage.getItem('sukkiri_ai_insights')) || [
    {
        id: 101,
        date: '2025/11/15',
        summary: `### 💡 今回の気づき
- バス移動の際、特に後方の座席に座っていると振動や揺れを強く感じてしまい、酔いやすくなる傾向が見られました。
- 今回は窓の外の景色を見る余裕が少なく、スマホの画面を注視してしまった時間が長かったことも一因のようです。
- 空腹すぎても満腹すぎても良くないですが、今回は少し空腹感が強かった可能性があります。

### 🛡️ 次回の対策
- バスの座席選びでは、タイヤの上を避け、なるべく中央より前の揺れの少ない席を確保するように心がけましょう。
- 乗車中はスマホをカバンにしまい、遠くの景色や地平線を意識的に見るようにします。
- 乗車30分前までに、消化の良い軽食（ビスケットやゼリーなど）を少し摂っておくことをお勧めします。`
    },
    {
        id: 102,
        date: '2025/11/22',
        summary: `### 💡 今回の気づき
- 山道のようなカーブの多い道では、ご自身で運転している時よりも助手席に乗っている時の方が酔いやすいようです。これは予測できない揺れに対する身体の準備ができていないためと考えられます。
- 車内の暖房が効きすぎていて、空気がこもっていたことも不快感を増助させた一因かもしれません。
- 柑橘系の香りが気分転換に有効であったという発見がありました。

### 🛡️ 次回の対策
- 助手席に乗る際は、なるべくドライバーと同じように前方のカーブを予測し、身体を揺れに合わせて動かす意識を持つと良いでしょう。
- 定期的に窓を開けて外の新鮮な空気を取り入れ、車内温度を適温に保つようにします。
- 次回からは、リフレッシュ用としてレモンやミントのアロマオイル、または柑橘系のタブレットを携帯するようにしましょう。`
    }
];
let filterState = { category: null, value: null };
let onScrollHandler = null;
let resizeObserver = null;

// --- Navigation Logic ---
function navigateTo(pageId, params = {}) {
    if (onScrollHandler) {
        window.removeEventListener('scroll', onScrollHandler);
        onScrollHandler = null;
    }
    if (resizeObserver) {
        resizeObserver.disconnect();
        resizeObserver = null;
    }

    document.querySelectorAll('.nav-btn').forEach(btn => {
        if (btn.id !== 'nav-record') {
            btn.classList.remove('text-teal-500');
            btn.classList.add('text-gray-500');
        }
    });

    if (pageId !== 'record') {
        const activeBtn = document.getElementById(`nav-${pageId}`);
        if (activeBtn) {
            activeBtn.classList.add('text-teal-500');
            activeBtn.classList.remove('text-gray-500');
        }
    }

    const content = document.getElementById('content');
    content.innerHTML = '';
    content.style.marginTop = '0px';

    if (pageId === 'home') renderHome(content);
    if (pageId === 'record') renderRecord(content, params);
    if (pageId === 'history') renderHistory(content);
    if (pageId === 'profile') renderProfile(content);
    if (pageId === 'ai_chat') renderAiChat(content);

    window.scrollTo(0, 0);
}

// --- Home Screen (Quick Record UI) ---
function renderHome(container) {
    const goodTrips = records.filter(r => r.sickness <= 30).length;

    container.innerHTML = `
        <div class="slide-in space-y-6 pt-2 pb-24">
            <!-- Status Card -->
            <div class="bg-gradient-to-br from-teal-400 to-teal-600 rounded-3xl p-6 text-white shadow-lg text-center relative overflow-hidden">
                <div class="absolute top-0 right-0 p-4 opacity-20"><i class="fa-solid fa-leaf text-6xl"></i></div>
                <p class="text-sm opacity-90 mb-1">現在のステータス</p>
                <h2 class="text-3xl font-bold mb-2">自信がついてきました！</h2>
                <p class="text-sm">これまでの記録で、<span class="font-bold text-yellow-300 text-lg">${goodTrips}回</span> 快適に移動できています。</p>
            </div>
            
            <!-- Quick Record Card (Updated Vertical Layout) -->
            <div class="bg-white rounded-[32px] shadow-xl border border-slate-100 p-8 text-center relative overflow-hidden">
                <div class="absolute top-0 left-0 w-full h-2 bg-teal-500"></div>
                
                <h3 class="text-xl font-bold text-slate-700 mb-8 flex items-center justify-center gap-2">
                    <i class="fa-solid fa-stopwatch text-teal-500"></i> 今の気分をサクッと記録
                </h3>
                
                <div class="mb-8">
                    <!-- Large Emoji -->
                    <div class="mb-4 flex justify-center items-center">
                        <span class="text-[100px] leading-none transition-transform transform hover:scale-105 cursor-default filter drop-shadow-sm block" id="quick-emoji">🙂</span>
                    </div>

                    <!-- Large Value -->
                    <div class="mb-8 flex justify-center items-center">
                        <span class="font-bold text-teal-600 text-[80px] leading-none font-mono tracking-tighter transition-colors duration-300" id="quick-level">1</span>
                    </div>
                    
                    <!-- Slider -->
                    <div class="px-2">
                        <input type="range" id="quick-sickness" min="1" max="100" value="1" step="1" 
                            class="w-full h-3 bg-gray-100 rounded-full appearance-none cursor-pointer accent-teal-500 focus:outline-none focus:ring-4 focus:ring-teal-100 transition"
                            oninput="updateQuickDisplay(this.value)">
                        
                        <div class="flex justify-between text-xs text-gray-400 mt-3 font-bold">
                            <span>快適</span>
                            <span>限界</span>
                        </div>
                    </div>
                </div>

                <button onclick="saveQuickRecord()" class="w-full bg-gradient-to-r from-teal-500 to-teal-600 text-white font-bold py-4 rounded-2xl shadow-lg hover:shadow-xl transform active:scale-95 transition flex items-center justify-center gap-2 text-lg">
                    <i class="fa-solid fa-check"></i> 記録する
                </button>
                <p class="text-[10px] text-gray-400 mt-4">※日時は自動で保存されます。詳細は後で編集できます。</p>
            </div>

            <div class="bg-orange-50 rounded-xl p-4 flex items-start gap-3">
                <i class="fa-solid fa-lightbulb text-orange-400 mt-1"></i>
                <div class="text-sm text-gray-700">
                    <strong>ワンポイント</strong><br>
                    スマホの画面を見るのは控え、遠くの景色を見るようにしましょう。
                </div>
            </div>
        </div>
    `;
    // Init display
    updateQuickDisplay(1);
}

window.updateQuickDisplay = function (val) {
    const numVal = parseInt(val);
    let emoji = '🙂';
    let baseClass = "font-bold text-[80px] leading-none font-mono tracking-tighter transition-colors duration-300";
    let colorClass = "text-teal-600";

    if (numVal <= 30) { emoji = '🙂'; colorClass = "text-teal-600"; }
    else if (numVal <= 50) { emoji = '😐'; colorClass = "text-teal-700"; }
    else if (numVal <= 70) { emoji = '😰'; colorClass = "text-yellow-500"; }
    else if (numVal <= 90) { emoji = '🤢'; colorClass = "text-orange-500"; }
    else { emoji = '🤮'; colorClass = "text-red-600"; }

    document.getElementById('quick-emoji').innerText = emoji;
    const levelEl = document.getElementById('quick-level');
    levelEl.innerText = `${numVal}`;
    levelEl.className = `${baseClass} ${colorClass}`;
}

window.saveQuickRecord = function () {
    const sickness = document.getElementById('quick-sickness').value;
    const numSickness = parseInt(sickness);

    const now = new Date();
    const dateStr = new Date(now.getTime() - (now.getTimezoneOffset() * 60000)).toISOString().slice(0, 16);
    const weathers = ['sunny', 'rain', 'cloudy'];
    const w = weathers[Math.floor(Math.random() * weathers.length)];

    const newRecord = {
        id: Date.now(),
        date: dateStr,
        type: 'pending',
        sickness: numSickness,
        weather: w,
        note: '',
        hasVideo: false,
        hasImage: false,
        isIncomplete: true,
        isConsulted: false
    };

    records.push(newRecord);
    localStorage.setItem('sukkiri_records_v4', JSON.stringify(records));

    // --- Dynamic Feedback Logic ---
    const overlay = document.getElementById('success-overlay');
    let contentHTML = '';

    // Message Configuration based on Sickness Level
    if (numSickness <= 30) {
        // Good Condition
        contentHTML = `
            <div class="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-[32px] p-8 shadow-2xl flex flex-col items-center gap-5 min-w-[280px] pop-in border-t-8 border-teal-400">
                <div class="w-20 h-20 rounded-full bg-teal-50 flex items-center justify-center text-4xl mb-1 animate-bounce shadow-sm">
                    ✨
                </div>
                <div class="text-center">
                    <h3 class="text-2xl font-bold text-slate-700 mb-2">記録しました！</h3>
                    <p class="text-sm text-slate-500 leading-relaxed">良い調子ですね🌿<br>このまま快適に過ごせますように。</p>
                </div>
            </div>
        `;
    } else if (numSickness <= 70) {
        // Warning Condition
        contentHTML = `
            <div class="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-[32px] p-8 shadow-2xl flex flex-col items-center gap-5 min-w-[280px] pop-in border-t-8 border-yellow-400">
                <div class="w-20 h-20 rounded-full bg-yellow-50 flex items-center justify-center text-4xl mb-1 shadow-sm">
                    🍃
                </div>
                <div class="text-center">
                    <h3 class="text-2xl font-bold text-slate-700 mb-2">記録しました</h3>
                    <p class="text-sm text-slate-500 leading-relaxed">無理しないでくださいね。<br>遠くを見て、深呼吸しましょう🍵</p>
                </div>
            </div>
        `;
    } else {
        // Bad Condition
        contentHTML = `
            <div class="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-[32px] p-8 shadow-2xl flex flex-col items-center gap-5 min-w-[280px] pop-in border-t-8 border-rose-400">
                <div class="w-20 h-20 rounded-full bg-rose-50 flex items-center justify-center text-4xl mb-1 shadow-sm">
                    🌙
                </div>
                <div class="text-center">
                    <h3 class="text-2xl font-bold text-slate-700 mb-2">保存完了です</h3>
                    <p class="text-sm text-slate-500 font-bold leading-relaxed">辛い中ありがとうございます。<br>今はスマホを置いて休みましょう。</p>
                </div>
            </div>
        `;
    }

    overlay.innerHTML = contentHTML;
    overlay.classList.remove('hidden');

    setTimeout(() => {
        overlay.classList.add('hidden');
        // Reset slider
        document.getElementById('quick-sickness').value = 1;
        updateQuickDisplay(1);
    }, 2500); // Show long enough to read
}

// --- Record / Edit Screen ---
function renderRecord(container, params = {}) {
    const isEditMode = !!params.editId;
    let recordToEdit = null;
    let defaultDate = new Date().toISOString().slice(0, 16);
    let defaultSickness = 1;
    let defaultWeather = 'unknown';
    let defaultType = lastTransport;
    let defaultNote = '';

    if (isEditMode) {
        recordToEdit = records.find(r => r.id === params.editId);
        if (recordToEdit) {
            defaultDate = recordToEdit.date;
            defaultSickness = recordToEdit.sickness;
            defaultWeather = recordToEdit.weather;
            defaultType = recordToEdit.type === 'pending' ? lastTransport : recordToEdit.type;
            defaultNote = recordToEdit.note;
        }
    }

    container.innerHTML = `
        <div class="slide-in">
            <div class="flex items-center justify-between mb-4">
                <h2 class="text-xl font-bold text-gray-800">${isEditMode ? '記録を編集・追記' : '詳細を記録'}</h2>
                ${isEditMode ? '<span class="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded font-bold">編集中</span>' : '<span class="text-xs bg-gray-100 text-gray-500 px-2 py-1 rounded">自動入力ON</span>'}
            </div>
            
            <form id="recordForm" onsubmit="saveFullRecord(event, ${isEditMode ? params.editId : 'null'})" class="space-y-6 bg-white p-6 rounded-2xl shadow-sm">
                <div>
                    <label class="block text-sm font-bold text-gray-600 mb-1">日時</label>
                    <input type="datetime-local" id="input-date" value="${defaultDate}" class="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl font-bold text-gray-700">
                </div>
                <div>
                    <label class="block text-sm font-bold text-gray-600 mb-1">環境（天気・気圧）</label>
                    <div class="bg-blue-50 p-3 rounded-xl flex items-center justify-between border border-blue-100">
                        <div class="flex items-center gap-3">
                            <div id="weather-icon" class="w-10 h-10 rounded-full bg-white flex items-center justify-center text-blue-400 shadow-sm">
                                <i class="fa-solid fa-spinner fa-spin"></i>
                            </div>
                            <div>
                                <div id="weather-text" class="font-bold text-gray-700 text-sm">取得中...</div>
                                <div id="weather-detail" class="text-xs text-gray-500">位置情報から解析中</div>
                            </div>
                        </div>
                    </div>
                    <input type="hidden" id="input-weather" value="${defaultWeather}">
                </div>
                <div>
                    <label class="block text-sm font-bold text-gray-600 mb-2">乗り物の種類</label>
                    <div class="grid grid-cols-4 gap-2">
                        ${renderTransportOption('car', '車', defaultType)}
                        ${renderTransportOption('bus', 'バス', defaultType)}
                        ${renderTransportOption('train', '電車', defaultType)}
                        ${renderTransportOption('ship', '船', defaultType)}
                    </div>
                </div>
                <div class="bg-gray-50 p-4 rounded-xl">
                    <label class="block text-sm font-bold text-gray-600 mb-2">気分のレベル (1〜100)</label>
                    <div class="flex items-center justify-between mb-4 px-2">
                        <span class="text-4xl transition-transform" id="emoji-display">🙂</span>
                        <span class="font-bold text-teal-600 text-3xl" id="level-display">${defaultSickness}</span>
                    </div>
                    <input type="range" id="input-sickness" min="1" max="100" value="${defaultSickness}" step="1" oninput="updateRangeDisplay(this.value)" class="h-2">
                    <div class="flex justify-between text-xs text-gray-400 mt-2 px-1">
                        <span>快適</span>
                        <span>少し</span>
                        <span>悪い</span>
                        <span>限界</span>
                    </div>
                </div>
                
                <div>
                    <label class="block text-sm font-bold text-gray-600 mb-1">状況を動画で記録</label>
                    <div id="video-upload-area" class="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:bg-gray-50 transition cursor-pointer relative" onclick="document.getElementById('input-video').click()">
                        <input type="file" id="input-video" accept="video/*" class="hidden" onchange="handleVideoPreview(this)">
                        <div id="video-placeholder">
                            <i class="fa-solid fa-video text-3xl text-gray-300 mb-2"></i>
                            <p class="text-xs text-gray-500 font-bold">5秒程度の動画を追加</p>
                            <p class="text-[10px] text-gray-400">タップして撮影または選択</p>
                        </div>
                        <div id="video-preview-container" class="hidden">
                            <video id="video-preview" controls class="w-full rounded-lg max-h-40 bg-black"></video>
                            <button type="button" onclick="event.stopPropagation(); clearVideo();" class="absolute top-2 right-2 bg-gray-800 bg-opacity-70 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-red-500">
                                <i class="fa-solid fa-xmark"></i>
                            </button>
                            <p class="text-[10px] text-green-600 mt-1 font-bold"><i class="fa-solid fa-check"></i> 動画が選択されました</p>
                        </div>
                    </div>
                </div>

                <div>
                    <label class="block text-sm font-bold text-gray-600 mb-1">状況を画像で記録</label>
                    <div id="image-upload-area" class="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:bg-gray-50 transition cursor-pointer relative" onclick="document.getElementById('input-image').click()">
                        <input type="file" id="input-image" accept="image/*" class="hidden" onchange="handleImagePreview(this)">
                        <div id="image-placeholder">
                            <i class="fa-solid fa-image text-3xl text-gray-300 mb-2"></i>
                            <p class="text-xs text-gray-500 font-bold">写真を追加</p>
                            <p class="text-[10px] text-gray-400">タップして撮影または選択</p>
                        </div>
                        <div id="image-preview-container" class="hidden">
                            <img id="image-preview" class="w-full rounded-lg max-h-40 object-cover">
                            <button type="button" onclick="event.stopPropagation(); clearImage();" class="absolute top-2 right-2 bg-gray-800 bg-opacity-70 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-red-500">
                                <i class="fa-solid fa-xmark"></i>
                            </button>
                            <p class="text-[10px] text-green-600 mt-1 font-bold"><i class="fa-solid fa-check"></i> 画像が選択されました</p>
                        </div>
                    </div>
                </div>

                <div>
                    <label class="block text-sm font-bold text-gray-600 mb-1">メモ</label>
                    <textarea id="input-note" rows="2" class="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm" placeholder="気になったこと・実施した対策など">${defaultNote}</textarea>
                </div>
                <button type="submit" class="w-full bg-teal-500 text-white font-bold py-4 rounded-xl shadow-lg hover:bg-teal-600 transform active:scale-95 transition text-lg flex justify-center items-center gap-2">
                    <i class="fa-solid fa-check"></i> ${isEditMode ? '更新する' : '保存する'}
                </button>
            </form>
        </div>
    `;

    updateRangeDisplay(defaultSickness);
    if (defaultWeather === 'unknown') {
        fetchWeatherMock();
    } else {
        setWeatherDisplay(defaultWeather);
    }
}

// --- Added back renderTransportOption function ---
function renderTransportOption(value, label, current) {
    const checked = value === current ? 'checked' : '';
    const iconMap = { car: 'fa-car', bus: 'fa-bus', train: 'fa-train', ship: 'fa-ship' };
    return `
        <label class="cursor-pointer">
            <input type="radio" name="transport" value="${value}" class="peer hidden" ${checked}>
            <div class="p-3 border-2 border-transparent bg-gray-100 rounded-xl text-center text-gray-400 peer-checked:bg-teal-500 peer-checked:text-white peer-checked:shadow-md transition duration-200">
                <i class="fa-solid ${iconMap[value]} block text-xl mb-1"></i>
                <span class="text-xs font-bold">${label}</span>
            </div>
        </label>
    `;
}

function setWeatherDisplay(w) {
    const iconEl = document.getElementById('weather-icon');
    const textEl = document.getElementById('weather-text');
    const detailEl = document.getElementById('weather-detail');

    const data = {
        sunny: { label: '晴れ', temp: '24℃', press: '1013hPa', icon: 'fa-sun', color: 'text-orange-400' },
        rain: { label: '雨', temp: '19℃', press: '998hPa', icon: 'fa-cloud-rain', color: 'text-blue-500' },
        cloudy: { label: '曇り', temp: '21℃', press: '1005hPa', icon: 'fa-cloud', color: 'text-gray-400' },
        unknown: { label: '不明', temp: '--', press: '--', icon: 'fa-question', color: 'text-gray-300' }
    };
    const current = data[w] || data.unknown;

    if (iconEl) {
        iconEl.innerHTML = `<i class="fa-solid ${current.icon}"></i>`;
        iconEl.className = `w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm ${current.color}`;
        textEl.innerText = current.label;
        detailEl.innerText = `${current.temp} / ${current.press}`;
    }
}

window.saveFullRecord = function (e, editId) {
    e.preventDefault();

    const date = document.getElementById('input-date').value;
    const type = document.querySelector('input[name="transport"]:checked').value;
    const sickness = document.getElementById('input-sickness').value;
    const weather = document.getElementById('input-weather').value;
    const note = document.getElementById('input-note').value;
    const hasVideo = currentVideoFile !== null;
    const hasImage = currentImageFile !== null;

    lastTransport = type;
    localStorage.setItem('sukkiri_last_transport', type);

    if (editId) {
        // Update existing record
        const index = records.findIndex(r => r.id === editId);
        if (index !== -1) {
            records[index] = {
                ...records[index],
                date, type, sickness: parseInt(sickness), weather, note,
                isIncomplete: false
            };
            if (hasVideo) records[index].hasVideo = true;
            if (hasImage) records[index].hasImage = true;
        }
        alert('記録を更新しました！');
    } else {
        const newRecord = {
            id: Date.now(),
            date, type, sickness: parseInt(sickness), weather, note, hasVideo, hasImage, isIncomplete: false, isConsulted: false
        };
        records.push(newRecord);
        alert('詳細記録を保存しました！');
    }

    localStorage.setItem('sukkiri_records_v4', JSON.stringify(records));
    currentVideoFile = null;
    currentImageFile = null;
    navigateTo('history');
}

// --- History Renderer Updates (REMOVED FIXED POSITIONING) ---
function renderHistory(container) {
    let displayRecords = [...records].sort((a, b) => new Date(a.date) - new Date(b.date));

    if (filterState.category && filterState.value) {
        displayRecords = displayRecords.filter(r => {
            if (filterState.category === 'weather') return r.weather === filterState.value;
            if (filterState.category === 'transport') return r.type === filterState.value;
            if (filterState.category === 'condition') {
                if (filterState.value === 'good') return r.sickness <= 30;
                if (filterState.value === 'bad') return r.sickness > 30;
            }
            return true;
        });
    }

    const isWeatherActive = filterState.category === 'weather' ? 'bg-blue-100 text-blue-600 border-blue-200' : 'bg-white text-slate-400 border-slate-100';
    const isTransportActive = filterState.category === 'transport' ? 'bg-teal-100 text-teal-600 border-teal-200' : 'bg-white text-slate-400 border-slate-100';
    const isConditionActive = filterState.category === 'condition' ? 'bg-rose-100 text-rose-600 border-rose-200' : 'bg-white text-slate-400 border-slate-100';

    let filterMenuHtml = '';
    if (filterState.category) {
        let options = [];
        if (filterState.category === 'weather') options = [{ val: 'sunny', label: '晴れ', icon: 'fa-sun' }, { val: 'rain', label: '雨', icon: 'fa-cloud-rain' }, { val: 'cloudy', label: '曇り', icon: 'fa-cloud' }];
        else if (filterState.category === 'transport') options = [{ val: 'car', label: '車', icon: 'fa-car' }, { val: 'bus', label: 'バス', icon: 'fa-bus' }, { val: 'train', label: '電車', icon: 'fa-train' }, { val: 'ship', label: '船', icon: 'fa-ship' }];
        else if (filterState.category === 'condition') options = [{ val: 'good', label: '快適 (Lv.1-30)', icon: 'fa-face-smile text-teal-500' }, { val: 'bad', label: '不調 (Lv.31-100)', icon: 'fa-face-dizzy text-rose-500' }];

        const buttons = options.map(opt => `<button onclick="setFilterValue('${opt.val}')" class="px-3 py-1.5 rounded-full border text-xs font-bold flex items-center gap-1 transition ${filterState.value === opt.val ? 'bg-slate-800 text-white border-slate-800' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}"><i class="fa-solid ${opt.icon}"></i> ${opt.label}</button>`).join('');
        filterMenuHtml = `<div class="mb-4 bg-gray-50 p-3 rounded-xl border border-gray-100 animate-fade-in-down"><div class="flex justify-between items-center mb-2"><span class="text-xs font-bold text-gray-500">絞り込みオプション</span><button onclick="clearFilter()" class="text-xs text-blue-500 font-bold hover:underline"><i class="fa-solid fa-xmark"></i> 解除</button></div><div class="flex flex-wrap gap-2">${buttons}</div></div>`;
    }

    let chartItems = '';
    let detailListItems = '';

    if (displayRecords.length === 0) {
        chartItems = `<div class="p-6 text-gray-400 text-sm whitespace-nowrap flex items-center h-40">該当する記録がありません</div>`;
        detailListItems = `<div class="text-center text-gray-400 py-8">表示する詳細がありません</div>`;
    } else {
        const detailRecords = [...displayRecords].reverse();

        displayRecords.forEach((rec, index) => {
            const dateObj = new Date(rec.date);
            const dateDisplay = `${dateObj.getMonth() + 1}/${dateObj.getDate()}`;

            const weatherData = {
                sunny: { icon: 'fa-sun', color: 'text-orange-400' },
                rain: { icon: 'fa-cloud-rain', color: 'text-blue-500' },
                cloudy: { icon: 'fa-cloud', color: 'text-gray-400' },
                unknown: { icon: 'fa-question', color: 'text-gray-300' }
            };
            const w = weatherData[rec.weather] || weatherData.unknown;
            const iconMap = { car: 'fa-car', bus: 'fa-bus', train: 'fa-train', ship: 'fa-ship', pending: 'fa-circle-question' };
            const heightPercent = rec.sickness;
            let barColorClass = "bg-teal-100";
            if (rec.sickness >= 40) barColorClass = "bg-teal-300";
            if (rec.sickness >= 70) barColorClass = "bg-rose-400";
            if (rec.isIncomplete) barColorClass = "bg-yellow-300 border-2 border-yellow-500 border-dashed";

            const activeIndicator = (index === displayRecords.length - 1) ? `<div class="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-[9px] font-bold px-2 py-0.5 rounded-full shadow-md z-20 tracking-wider">LATEST</div>` : '';
            const clickHandler = `scrollToRecord(${rec.id})`;

            chartItems += `
                <div class="flex flex-col items-center min-w-[84px] group relative transition-colors pt-4">
                    <div class="h-[180px] w-full flex items-end justify-center pb-2 relative px-2">
                        <div class="absolute inset-x-1 inset-y-0 bg-gray-50 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity -z-10"></div>
                        <div class="${barColorClass} w-full max-w-[40px] rounded-t-2xl rounded-b-lg relative transition-all duration-300 group-hover:scale-105 cursor-pointer z-10" 
                            style="height: ${Math.max(rec.sickness, 10)}%; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);"
                            onclick="${clickHandler}">
                            ${rec.note ? `<div class="absolute -top-3 -right-1 w-3 h-3 bg-indigo-400 rounded-full border-2 border-white shadow-sm"></div>` : ''}
                            ${rec.isIncomplete ? `<div class="absolute -top-4 -left-2"><i class="fa-solid fa-triangle-exclamation text-yellow-500 drop-shadow-sm text-sm"></i></div>` : ''}
                        </div>
                        ${activeIndicator}
                    </div>
                    <div class="w-full flex flex-col items-center gap-3 py-3">
                        <div class="text-lg font-bold text-slate-700 leading-none font-mono">${rec.sickness}</div>
                        <div class="text-center mt-1">
                            <div class="text-xs font-bold text-slate-400">${dateObj.getDate()}</div>
                            <div class="text-[9px] text-slate-300 uppercase font-bold">Day</div>
                        </div>
                    </div>
                </div>
            `;
        });

        // Generate Detail List
        detailRecords.forEach(rec => {
            const dateObj = new Date(rec.date);
            const dateDisplay = `${dateObj.getMonth() + 1}/${dateObj.getDate()}`;
            const timeDisplay = `${dateObj.getHours()}:${String(dateObj.getMinutes()).padStart(2, '0')}`;

            const wIcon = { sunny: 'fa-sun text-orange-400', rain: 'fa-cloud-rain text-blue-500', cloudy: 'fa-cloud text-gray-400', unknown: 'fa-question text-gray-300' }[rec.weather];
            const iconMap = { car: 'fa-car', bus: 'fa-bus', train: 'fa-train', ship: 'fa-ship', pending: 'fa-circle-question' };
            const labelMap = { car: '車', bus: 'バス', train: '電車', ship: '船', pending: '未設定' };

            let statusColor = "text-teal-600 bg-teal-50 border-teal-100";
            if (rec.sickness >= 40) statusColor = "text-teal-700 bg-teal-100 border-teal-200";
            if (rec.sickness >= 70) statusColor = "text-rose-600 bg-rose-50 border-rose-100";

            const incompleteWarning = rec.isIncomplete ? `<div class="mb-2 bg-yellow-50 text-yellow-700 text-xs font-bold px-2 py-1 rounded border border-yellow-200 inline-block"><i class="fa-solid fa-triangle-exclamation mr-1"></i> 詳細未入力</div>` : '';

            // Media Thumbnails
            let mediaThumbnails = '';
            if (rec.hasVideo || rec.hasImage) {
                mediaThumbnails = `<div class="mt-3 flex gap-2 overflow-x-auto pb-1">`;
                if (rec.hasVideo) {
                    if (rec.videoSrc) {
                        mediaThumbnails += `
                        <div class="w-20 h-14 bg-black rounded-lg flex items-center justify-center flex-shrink-0 shadow-sm border border-slate-200 relative overflow-hidden group">
                           <video src="${rec.videoSrc}" class="w-full h-full object-cover opacity-80"></video>
                           <i class="fa-solid fa-play text-white text-xl drop-shadow-md absolute z-10"></i>
                        </div>`;
                    } else {
                        mediaThumbnails += `
                        <div class="w-20 h-14 bg-slate-800 rounded-lg flex items-center justify-center flex-shrink-0 shadow-sm border border-slate-200 relative overflow-hidden group">
                            <div class="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition"></div>
                            <i class="fa-solid fa-play text-white text-xl drop-shadow-md"></i>
                        </div>`;
                    }
                }
                if (rec.hasImage) {
                    if (rec.imageSrc) {
                        mediaThumbnails += `
                        <div class="w-20 h-14 bg-slate-100 rounded-lg flex items-center justify-center flex-shrink-0 shadow-sm border border-slate-200 overflow-hidden">
                            <img src="${rec.imageSrc}" class="w-full h-full object-cover">
                        </div>`;
                    } else {
                        mediaThumbnails += `
                        <div class="w-20 h-14 bg-slate-100 rounded-lg flex items-center justify-center flex-shrink-0 shadow-sm border border-slate-200 text-slate-300">
                            <i class="fa-solid fa-image text-xl"></i>
                        </div>`;
                    }
                }
                mediaThumbnails += `</div>`;
            }

            detailListItems += `
                <div id="record-${rec.id}" onclick="showDetail(${rec.id})" class="bg-white rounded-2xl p-4 shadow-sm border ${rec.isIncomplete ? 'border-yellow-300 ring-1 ring-yellow-100' : 'border-slate-100'} flex gap-4 items-start transition-all duration-500 cursor-pointer hover:bg-slate-50 relative">
                    <div class="flex flex-col items-center gap-1 w-12 flex-shrink-0">
                        <span class="text-xs font-bold text-slate-400">${dateDisplay}</span>
                        <span class="text-[10px] text-slate-300">${timeDisplay}</span>
                        <div class="mt-2 w-10 h-10 rounded-full ${statusColor} border flex flex-col items-center justify-center">
                            <span class="text-[8px] font-bold opacity-70">Lv</span>
                            <span class="text-sm font-bold leading-none">${rec.sickness}</span>
                        </div>
                    </div>
                    <div class="flex-grow pt-1">
                        ${incompleteWarning}
                        <div class="flex items-center gap-2 mb-2">
                            <span class="text-xs font-bold text-slate-600 bg-slate-50 px-2 py-1 rounded border border-slate-100 flex items-center gap-1">
                                <i class="fa-solid ${iconMap[rec.type]} text-slate-400"></i> ${labelMap[rec.type]}
                            </span>
                            <span class="text-xs font-bold text-slate-600 bg-slate-50 px-2 py-1 rounded border border-slate-100 flex items-center gap-1">
                                <i class="fa-solid ${wIcon}"></i>
                            </span>
                        </div>
                        <p class="text-sm text-slate-700 leading-relaxed bg-slate-50/50 p-2 rounded-lg border border-transparent hover:border-slate-100 transition">
                            ${rec.note || '<span class="text-slate-300 italic">メモなし</span>'}
                        </p>
                        ${mediaThumbnails}
                    </div>
                </div>
            `;
        });
    }

    container.innerHTML = `
        <div class="slide-in pb-24 relative">
            <!-- Header Area (NO FIXED POSITIONING) -->
            <div class="bg-[#F0FDFA] border-b border-slate-100/50 shadow-sm pb-4 pt-2">
                <div class="px-4">
                    <div class="flex justify-between items-end mb-4">
                        <div>
                            <p class="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">HISTORY</p>
                            <h2 class="text-xl font-bold text-slate-700">傾向をチェック</h2>
                        </div>
                        <div class="flex gap-2">
                            <button onclick="toggleFilterCategory('weather')" class="${isWeatherActive} border px-3 py-1.5 rounded-full text-[10px] font-bold transition shadow-sm"><i class="fa-solid fa-cloud mr-1"></i>天気</button>
                            <button onclick="toggleFilterCategory('transport')" class="${isTransportActive} border px-3 py-1.5 rounded-full text-[10px] font-bold transition shadow-sm"><i class="fa-solid fa-car mr-1"></i>乗り物</button>
                            <button onclick="toggleFilterCategory('condition')" class="${isConditionActive} border px-3 py-1.5 rounded-full text-[10px] font-bold transition shadow-sm"><i class="fa-solid fa-heart-pulse mr-1"></i>体調</button>
                        </div>
                    </div>
                    ${filterMenuHtml}
                    <div class="bg-white rounded-[24px] shadow-lg shadow-slate-200/50 border border-slate-50 overflow-hidden relative">
                        <div class="absolute top-[100px] left-0 w-full h-[1px] bg-slate-100 z-0"></div>
                        <div class="absolute top-[100px] left-2 text-[9px] text-slate-300 font-bold bg-white px-1 z-0">AVG</div>
                        <div class="flex pt-4 pb-2 overflow-x-auto no-scrollbar relative z-10">
                            <div class="w-4 flex-shrink-0"></div>
                            <div class="flex">${chartItems}</div>
                            <div class="w-6 flex-shrink-0"></div>
                        </div>
                    </div>
                    <div class="flex justify-end items-center mt-2 px-2 gap-4">
                        <div class="flex items-center gap-1.5"><span class="w-2 h-2 rounded-full bg-teal-100"></span><span class="text-[9px] text-slate-400 font-bold">快適</span></div>
                        <div class="flex items-center gap-1.5"><span class="w-2 h-2 rounded-full bg-rose-400"></span><span class="text-[9px] text-slate-400 font-bold">不調</span></div>
                    </div>
                </div>
            </div>

            <div class="px-2 mt-4">
                <h3 class="font-bold text-slate-700 mb-4 px-2 flex items-center gap-2"><i class="fa-solid fa-list-ul text-teal-500"></i> 詳細タイムライン</h3>
                <div class="space-y-3 pb-8">${detailListItems}</div>
            </div>
        </div>
    `;
}

// --- Modal Logic (Updated to Handle Edit) ---
window.scrollToRecord = function (id) {
    const el = document.getElementById(`record-${id}`);
    if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        el.classList.add('ring-2', 'ring-teal-400', 'bg-teal-50');
        setTimeout(() => { el.classList.remove('ring-2', 'ring-teal-400', 'bg-teal-50'); }, 2000);
    }
}

window.showDetail = function (id) {
    const rec = records.find(r => r.id === id);
    if (!rec) return;

    const dateObj = new Date(rec.date);
    document.getElementById('modal-date').innerText = `${dateObj.getMonth() + 1}/${dateObj.getDate()} ${dateObj.getHours()}:${String(dateObj.getMinutes()).padStart(2, '0')}`;

    const wIcon = { sunny: 'fa-sun text-orange-400', rain: 'fa-cloud-rain text-blue-500', cloudy: 'fa-cloud text-gray-400', unknown: 'fa-question text-gray-300' }[rec.weather] || 'fa-question text-gray-300';
    document.getElementById('modal-weather').innerHTML = `<i class="fa-solid ${wIcon}"></i>`;

    document.getElementById('modal-sickness').innerText = `Lv.${rec.sickness}`;
    let emoji = '🙂'; let colorClass = "text-2xl font-bold text-teal-600";
    if (rec.sickness >= 40) { emoji = '😐'; colorClass = "text-2xl font-bold text-yellow-500"; }
    if (rec.sickness >= 70) { emoji = '🤢'; colorClass = "text-2xl font-bold text-red-600"; }
    document.getElementById('modal-emoji').innerText = emoji;
    document.getElementById('modal-sickness').className = colorClass;

    document.getElementById('modal-note').innerText = rec.note || "メモはありません";

    if (rec.isIncomplete) document.getElementById('modal-incomplete-warning').classList.remove('hidden');
    else document.getElementById('modal-incomplete-warning').classList.add('hidden');

    document.getElementById('modal-edit-btn').onclick = function () {
        closeDetail();
        // FIXED: Ensure ID is safe
        navigateTo('record', { editId: rec.id });
    };

    const videoSection = document.getElementById('modal-video-section');
    if (rec.hasVideo) {
        videoSection.classList.remove('hidden');
        if (rec.videoSrc) {
            videoSection.innerHTML = `
                <p class="text-xs text-gray-400 font-bold mb-1">動画記録</p>
                <video src="${rec.videoSrc}" controls class="w-full rounded-lg bg-black aspect-video"></video>
            `;
        } else {
            // Fallback / original placeholder
            videoSection.innerHTML = `
                <p class="text-xs text-gray-400 font-bold mb-1">動画記録</p>
                <div class="aspect-video bg-black rounded-lg flex items-center justify-center relative overflow-hidden group cursor-pointer">
                    <i class="fa-solid fa-play text-4xl text-white opacity-80 group-hover:scale-110 transition"></i>
                    <div class="absolute inset-0 bg-black bg-opacity-20"></div>
                    <p class="absolute bottom-2 right-3 text-white text-xs font-bold shadow-black drop-shadow-md">再生 (デモ)</p>
                </div>
            `;
        }
    } else {
        videoSection.classList.add('hidden');
    }

    // Image Section (Dynamically added if not exists in HTML, or check if exists)
    let imageSection = document.getElementById('modal-image-section');
    if (!imageSection) {
        // Create it if it doesn't exist (it wasn't in the original HTML)
        imageSection = document.createElement('div');
        imageSection.id = 'modal-image-section';
        imageSection.className = 'hidden mt-4';
        // Insert after video section or at the end of parent
        if (videoSection && videoSection.parentNode) {
            videoSection.parentNode.insertBefore(imageSection, videoSection.nextSibling);
        }
    }

    if (rec.hasImage) {
        imageSection.classList.remove('hidden');
        if (rec.imageSrc) {
            imageSection.innerHTML = `
                <p class="text-xs text-gray-400 font-bold mb-1">画像記録</p>
                <img src="${rec.imageSrc}" class="w-full rounded-lg object-cover shadow-sm bg-gray-100">
            `;
        } else {
            imageSection.innerHTML = `
                <p class="text-xs text-gray-400 font-bold mb-1">画像記録</p>
                <div class="aspect-video bg-gray-100 rounded-lg flex items-center justify-center relative overflow-hidden group cursor-pointer">
                    <i class="fa-solid fa-image text-4xl text-gray-300"></i>
                    <p class="absolute bottom-2 right-3 text-gray-500 text-xs font-bold shadow-white drop-shadow-md">画像 (デモ)</p>
                </div>
            `;
        }
    } else {
        imageSection.classList.add('hidden');
    }

    document.getElementById('detail-modal').classList.remove('hidden');
}

// --- Other helpers ---
window.closeDetail = function () {
    document.getElementById('detail-modal').classList.add('hidden');
}

function renderProfile(container) {
    if (!userProfile) { renderSurvey(container); } else { renderProfileDetails(container); }
}
function renderSurvey(container) {
    container.innerHTML = `
        <div class="slide-in pb-24">
            <div class="text-center mb-8 pt-4">
                <span class="inline-block px-3 py-1 bg-teal-50 text-teal-600 rounded-full text-xs font-bold mb-2 tracking-wider">DIAGNOSIS</span>
                <h2 class="text-2xl font-bold text-slate-800">あなたの感覚をチェック</h2>
                <p class="text-xs text-slate-400 mt-2 leading-relaxed">正確なアドバイスのため、<br>直感で正直にお答えください。</p>
            </div>
            
            <div class="bg-white/80 backdrop-blur-sm p-1 rounded-[32px] shadow-xl shadow-slate-200/50 border border-white space-y-8 px-6 py-8">
                <form id="surveyForm" onsubmit="submitSurvey(event)" class="space-y-10">
                    
                    ${renderQuestionBlock('q1', '乗り物に酔いやすい', 'fa-car-side')}
                    ${renderQuestionBlock('q2', '上下に動くものが苦手', 'fa-elevator', '例：エレベーター、ジェットコースターなど')}
                    ${renderQuestionBlock('q3', '高い所や階段が怖い', 'fa-stairs')}

                    <div class="pt-4">
                        <button type="submit" class="w-full bg-gradient-to-r from-teal-400 to-teal-600 text-white font-bold py-4 rounded-2xl shadow-lg shadow-teal-200/50 hover:shadow-xl hover:scale-[1.02] active:scale-95 transition-all duration-300 flex items-center justify-center gap-2 text-lg group">
                            <span>診断結果を見る</span>
                            <i class="fa-solid fa-arrow-right group-hover:translate-x-1 transition-transform"></i>
                        </button>
                    </div>
                </form>
            </div>
        </div>`;
}

function renderQuestionBlock(name, title, icon, sub = '') {
    return `
    <div class="space-y-4">
        <div class="flex items-center gap-3 mb-3">
            <div class="w-10 h-10 rounded-2xl bg-teal-50 text-teal-500 flex items-center justify-center shadow-sm">
                <i class="fa-solid ${icon} text-lg"></i>
            </div>
            <div>
                <p class="font-bold text-slate-700 text-sm">${title}</p>
                ${sub ? `<p class="text-[10px] text-slate-400 mt-0.5">${sub}</p>` : ''}
            </div>
        </div>
        
        <div class="grid grid-cols-4 gap-2 relative">
            <!-- Labels for the range edges -->
            <div class="col-span-4 flex justify-between text-[10px] text-slate-300 font-bold px-1 mb-1">
                <span>全然</span>
                <span>すごく</span>
            </div>

            <!-- Options -->
            ${renderOptionBtn(name, 0, 'emwa-laugh', 'bg-slate-100', 'text-slate-400')}
            ${renderOptionBtn(name, 1, 'emwa-meh', 'bg-teal-50', 'text-teal-400')}
            ${renderOptionBtn(name, 2, 'emwa-sad', 'bg-teal-100', 'text-teal-500')}
            ${renderOptionBtn(name, 3, 'emwa-dizzy', 'bg-teal-200', 'text-teal-600')}
        </div>
    </div>
    `;
}

function renderOptionBtn(name, val, iconClass, bgBase, textBase) {
    // Determine gradient or color intensity based on value for visual hierarchy
    let activeClass = 'peer-checked:ring-2 peer-checked:ring-teal-400 peer-checked:bg-white peer-checked:text-teal-600';
    if (val === 3) activeClass = 'peer-checked:ring-2 peer-checked:ring-rose-400 peer-checked:bg-rose-50 peer-checked:text-rose-600';

    return `
    <label class="cursor-pointer relative group">
        <input type="radio" name="${name}" value="${val}" required class="peer hidden">
        <div class="w-full aspect-square rounded-2xl ${bgBase} ${textBase} flex flex-col items-center justify-center gap-1 transition-all duration-300 ${activeClass} hover:scale-105 shadow-sm border border-transparent">
            <span class="text-lg font-bold font-mono">${val}</span>
        </div>
        <div class="absolute -bottom-2 left-1/2 -translate-x-1/2 w-1 h-1 bg-teal-500 rounded-full opacity-0 peer-checked:opacity-100 transition-opacity"></div>
    </label>
    `;
}
function renderProfileDetails(container) {
    let gradient = "profile-card-gradient";
    let icon = "fa-person-falling-burst"; // general icon
    let description = "あなたの現在の酔いやすさレベルです。";

    // Level classification just for color/icon hint
    const score = userProfile.sicknessPercentage || 0;
    let levelLabel = "低";
    if (score >= 40) { levelLabel = "中"; icon = "fa-face-flushed"; }
    if (score >= 70) { levelLabel = "高"; icon = "fa-face-dizzy text-rose-500"; }

    container.innerHTML = `
        <div class="slide-in pb-20">
            <div class="mb-6 flex justify-between items-end px-2">
                <h2 class="text-2xl font-bold text-slate-700">プロフィール</h2>
                <button onclick="resetProfile()" class="text-xs text-slate-400 hover:text-teal-500 underline">再診断する</button>
            </div>
            
            <div class="${gradient} p-6 rounded-[32px] shadow-lg border border-white relative overflow-hidden mb-6">
                <!-- Circular Progress Mock -->
                <div class="flex flex-col items-center justify-center py-4">
                    <div class="relative w-40 h-40 flex items-center justify-center">
                        <svg class="w-full h-full transform -rotate-90">
                            <circle cx="80" cy="80" r="70" stroke="#fff" stroke-width="12" fill="none" opacity="0.3"></circle>
                            <circle cx="80" cy="80" r="70" stroke="${score >= 70 ? '#f43f5e' : '#14b8a6'}" stroke-width="12" fill="none" 
                                stroke-dasharray="440" stroke-dashoffset="${440 - (440 * score / 100)}" 
                                stroke-linecap="round" class="transition-all duration-1000 ease-out"></circle>
                        </svg>
                        <div class="absolute flex flex-col items-center">
                            <span class="text-4xl font-bold text-slate-700">${score}<span class="text-lg">%</span></span>
                            <span class="text-xs font-bold text-slate-400">酔いやすさ</span>
                        </div>
                    </div>
                </div>

                <div class="bg-white/60 backdrop-blur-sm p-4 rounded-xl mb-2 text-center">
                   <p class="text-sm font-bold text-slate-700">レベル: ${levelLabel}</p>
                   <p class="text-xs text-slate-500 mt-1">数値をAI相談の参考にします。</p>
                </div>
            </div>

            <div class="grid grid-cols-2 gap-4 mb-6">
                <div class="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 text-center"><p class="text-xs text-slate-400 font-bold mb-1">記録回数</p><p class="text-2xl font-bold text-teal-500">${records.length}<span class="text-xs text-slate-400 ml-1">回</span></p></div>
                <div class="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 text-center"><p class="text-xs text-slate-400 font-bold mb-1">快適率</p><p class="text-2xl font-bold text-teal-500">${Math.round((records.filter(r => r.sickness <= 30).length / records.length) * 100) || 0}<span class="text-xs text-slate-400 ml-1">%</span></p></div>
            </div>
        </div>`;
}
window.submitSurvey = function (e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const q1 = parseInt(formData.get('q1'));
    const q2 = parseInt(formData.get('q2'));
    const q3 = parseInt(formData.get('q3'));

    const totalScore = q1 + q2 + q3; // Max 9
    const percentage = Math.round((totalScore / 9) * 100);

    userProfile = {
        sicknessScore: totalScore,
        sicknessPercentage: percentage,
        answers: { q1, q2, q3 },
        date: new Date().toISOString()
    };

    localStorage.setItem('sukkiri_profile_v1', JSON.stringify(userProfile));
    renderProfile(document.getElementById('content'));
}
window.resetProfile = function () { if (confirm("診断結果をリセットして、最初からやり直しますか？")) { userProfile = null; localStorage.removeItem('sukkiri_profile_v1'); renderProfile(document.getElementById('content')); } }

// --- AI Logic with Multimodal Support ---
// Remove hardcoded key
// const apiKey = "AIzaSyBnoGErzRgA7Djuk-RPpunZg-SnKXCpUXo";

function getApiKey() {
    return localStorage.getItem('sukkiri_gemini_api_key');
}

function saveApiKey(key) {
    if (key) {
        localStorage.setItem('sukkiri_gemini_api_key', key);
        alert("APIキーを保存しました。");
        renderAiChat(document.getElementById('content'));
    }
}

window.configureApiKey = function () {
    const currentKey = getApiKey() || '';
    const newKey = prompt("Gemini APIキーを入力してください:", currentKey);
    if (newKey !== null) {
        saveApiKey(newKey.trim());
    }
}

function renderAiChat(container) {
    const hasHistory = aiInsights.length > 0;
    const hasKey = !!getApiKey();
    container.innerHTML = `
        <div class="slide-in pb-20 h-full flex flex-col relative">
            <button onclick="configureApiKey()" class="absolute top-0 right-0 p-2 text-slate-400 hover:text-teal-500 transition" title="APIキー設定">
                <i class="fa-solid fa-gear"></i>
            </button>
            <div class="mb-4 text-center"><h2 class="text-2xl font-bold text-slate-700 flex items-center justify-center gap-2"><i class="fa-solid fa-robot text-teal-500"></i> AIコーチ</h2><p class="text-xs text-slate-500 mt-1">対話を通して、あなたの酔いの原因を探ります。</p></div>
            <div id="chat-window" class="flex-grow bg-slate-50 rounded-2xl p-4 mb-4 border border-slate-100 overflow-y-auto min-h-[300px] max-h-[50vh] shadow-inner space-y-4">
                ${!hasKey ? `<div class="text-center py-10 text-red-400"><i class="fa-solid fa-key text-4xl mb-2 opacity-50"></i><p class="text-sm font-bold">APIキーが設定されていません</p><p class="text-xs mt-2">右上の設定ボタンから<br>Gemini APIキーを入力してください。</p></div>` :
            chatSession.length === 0 ? `<div class="text-center py-10 text-slate-400"><i class="fa-solid fa-comments text-4xl mb-2 opacity-50"></i><p class="text-sm">「相談を始める」を押して<br>振り返りをスタートしましょう。</p></div>` : ''}
            </div>
            <div class="flex gap-2 mb-8"><input type="text" id="chat-input" ${!hasKey ? 'disabled' : ''} class="flex-grow p-3 rounded-xl border border-slate-200 focus:outline-none focus:border-teal-500 text-sm" placeholder="メッセージを入力..." onkeypress="handleEnter(event)"><button onclick="sendMessage()" id="send-btn" ${!hasKey ? 'disabled' : ''} class="bg-teal-500 text-white rounded-xl w-12 flex items-center justify-center hover:bg-teal-600 disabled:opacity-50 disabled:cursor-not-allowed"><i class="fa-solid fa-paper-plane"></i></button></div>
            <div class="flex justify-center mb-8"><button onclick="startNewSession()" ${!hasKey ? 'disabled' : ''} class="bg-indigo-500 text-white px-6 py-3 rounded-full text-sm font-bold shadow-md hover:bg-indigo-600 transition flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"><i class="fa-solid fa-arrows-rotate"></i> 新しい相談を始める</button></div>
            <div class="border-t border-slate-100 pt-6"><h3 class="font-bold text-slate-700 mb-3 px-2 flex items-center gap-2"><i class="fa-solid fa-lightbulb text-yellow-400"></i> これまでの気づきメモ</h3><div class="space-y-3 px-1">${hasHistory ? aiInsights.map(insight => `<div class="bg-yellow-50 p-4 rounded-xl border border-yellow-100 text-sm text-slate-700 shadow-sm relative group"><p class="font-bold text-xs text-yellow-600 mb-1">${insight.date}</p><div class="markdown-body text-xs leading-relaxed">${marked.parse(insight.summary)}</div><button onclick="deleteInsight(${insight.id})" class="absolute top-2 right-2 text-slate-300 hover:text-red-400 opacity-0 group-hover:opacity-100 transition"><i class="fa-solid fa-trash"></i></button></div>`).join('') : '<p class="text-xs text-slate-400 text-center py-4">まだ記録がありません。</p>'}</div></div>
        </div>`;
    if (chatSession.length > 0) { const chatWindow = document.getElementById('chat-window'); chatWindow.innerHTML = ''; chatSession.forEach(msg => appendMessage(msg.role, msg.text, false)); scrollToBottom(); }
}


// Helper to convert URL to Base64
async function urlToBase64(url) {
    const response = await fetch(url);
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
            const base64String = reader.result.split(',')[1];
            resolve({
                mimeType: blob.type,
                data: base64String
            });
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });
}

async function startNewSession() {
    const key = getApiKey();
    if (!key) {
        alert("APIキーが設定されていません。右上の設定ボタンからキーを入力してください。");
        return;
    }

    chatSession = [];
    document.getElementById('chat-window').innerHTML = '';

    // --- Consultation Prioritization Logic ---
    // 1. Filter for records that have NOT been consulted yet
    let candidateRecords = records.filter(r => !r.isConsulted);
    let targetRecord = null;
    let consultationReason = "";

    if (candidateRecords.length > 0) {
        // If there are un-consulted records, pick the one with the highest sickness
        // (sort descending by sickness)
        candidateRecords.sort((a, b) => b.sickness - a.sickness);
        targetRecord = candidateRecords[0];
        consultationReason = "これはまだAIに相談していない記録の中で、最も酔いレベルが高かったものです。";
    } else {
        // If all records have been consulted (or no records exist), fallback to recent high sickness
        const recentRecords = records.slice(-5);
        if (recentRecords.length > 0) {
            // Find max sickness in recent
            targetRecord = recentRecords.reduce((prev, current) => (prev.sickness > current.sickness) ? prev : current);
            consultationReason = "直近の記録の中で、特に酔いが強かった時のものです。";
        }
    }

    // Mark the target record as consulted (if it exists)
    if (targetRecord) {
        targetRecord.isConsulted = true;
        // Update localStorage
        const idx = records.findIndex(r => r.id === targetRecord.id);
        if (idx !== -1) {
            records[idx].isConsulted = true;
            localStorage.setItem('sukkiri_records_v4', JSON.stringify(records));
        }
    }

    // Context preparation
    // We still provide recent context, but highlight the target record
    const recentContext = records.slice(-5);
    const contextData = { records: recentContext, profile: userProfile };

    // Base prompt text
    let promptParts = [
        {
            text: `
        あなたは「乗り物酔い対策の相談相手」です。
        ユーザーの主体性を尊重し、ユーザー自身が酔いの原因や対策に気づけるように、優しく問いかけてください。

        # ユーザー情報
        ${JSON.stringify(contextData)}

        # 今回の相談の焦点（重要）
        以下の記録について、優先的にユーザーに尋ねてください。
        [対象記録ID: ${targetRecord ? targetRecord.id : 'なし'}]
        理由: ${consultationReason}

        # 指示
        1. 基本的に「対象記録」について質問を投げかけてください。「この時のことについて教えてください」など。
        2. 画像や動画が提供されている場合は、その視覚情報を分析し、「画像を見ると〜のようですが、この時どのような感じでしたか？」のように具体的に触れてください。
        3. プロフィールにある「sicknessPercentage」（酔いやすさレベル）が高い場合は、より慎重に、ユーザーの辛さに寄り添った言葉を選んでください。
        4. 決して断定せず、「〜だった可能性はありますか？」のように可能性を提示してください。
        5. 会話は簡潔に（最大150文字程度）、テンポよく進めてください。
        6. 質問をする際は、ユーザーが答えやすいように、1度に複数の質問を投げかけないように意識してください。
        ` }
    ];

    // Check for media in recent records and append as inline_data
    // Note: We associate media with the prompt by adding text context before the media part.
    for (const rec of recentContext) {
        if (rec.imageSrc) {
            try {
                const imageData = await urlToBase64(rec.imageSrc);
                promptParts.push({ text: `\n[記録ID: ${rec.id} の画像データ]:` });
                promptParts.push({ inline_data: imageData });
            } catch (e) { console.error("Failed to load image for AI", e); }
        }
        if (rec.videoSrc) {
            try {
                const videoData = await urlToBase64(rec.videoSrc);
                promptParts.push({ text: `\n[記録ID: ${rec.id} の動画データ]:` });
                promptParts.push({ inline_data: videoData });
            } catch (e) {
                console.error("Failed to load video for AI", e);
                promptParts.push({ text: `\n[記録ID: ${rec.id} には動画がありますが、読み込みに失敗しました。ユーザーに動画の内容を尋ねてください。]` });
            }
        }
    }

    await callGemini(promptParts, true);
}

async function sendMessage() {
    const input = document.getElementById('chat-input');
    const text = input.value.trim();
    if (!text) return;
    input.value = '';
    appendMessage('user', text);
    document.getElementById('send-btn').disabled = true;
    document.getElementById('chat-input').disabled = true;

    // Turn count logic: chatSession has just been updated with user message.
    const isSummaryPhase = chatSession.length >= 7;

    let prompt = '';

    if (isSummaryPhase) {
        prompt = `
        ユーザーの回答: "${text}"

        これまでの会話を踏まえて、ここまでの振り返りをまとめてください。
        以下の【まとめ】フォーマットに厳密に従って出力してください。
        これ以上の質問はしないでください。

        【まとめ】
        ### 💡 今回の気づき
        - (ここに対話から見えた原因や傾向を箇条書きで記載)
        
        ### 一行開ける

        ### 🛡️ 次回の対策
        - (ここに具体的な対策を箇条書きで記載)
        `;
    } else {
        prompt = `
        ユーザーの回答: "${text}"
        
        # これまでの文脈を踏まえて、ユーザーに共感し、さらに深掘りする質問をするか、あるいはここまでの会話から考えられる「酔いの原因の仮説」を優しく提案してください。
        # 質問内容としては、以下の2点を主に聞き出せるようにしてください。
            1. 試してみて効果がありそうだと感じた対策方法
            2. 今までの会話の深堀り
            3. 提供された画像や動画がある場合、その内容から推測できる原因（揺れの激しさ、明るさ、視線の方向など）について触れる

        # 会話は簡潔に（最大200文字程度）、テンポよく進めてください

        #質問は、1回の発言につき1つだけにしてください。どうしてもという場合は、2つまでにしてください。

        # 以前記録した「これまでの気づきメモ」の内容から、複合的に考えられる要素があれば、それを踏まえてユーザーと会話するようにしてください。

        # 今回の会話だけで酔いの原因や対策を結論づけるのではなく、次回以降の糧となるような会話を心がけるようにしてください。
        `;
    }

    await callGemini(prompt);
    document.getElementById('send-btn').disabled = false;
    document.getElementById('chat-input').disabled = false;
    document.getElementById('chat-input').focus();
}

function handleEnter(e) { if (e.key === 'Enter') sendMessage(); }
function appendMessage(role, text, save = true) { const chatWindow = document.getElementById('chat-window'); const div = document.createElement('div'); div.className = role === 'user' ? 'chat-bubble-user' : 'chat-bubble-ai'; div.innerHTML = role === 'model' ? marked.parse(text) : text; div.classList.add('slide-in'); chatWindow.appendChild(div); scrollToBottom(); if (save) chatSession.push({ role, text }); if (save && role === 'model' && text.includes('【まとめ】')) saveSummary(text); }
function showTypingIndicator() { const chatWindow = document.getElementById('chat-window'); const div = document.createElement('div'); div.id = 'typing-indicator'; div.className = 'chat-bubble-ai'; div.innerHTML = '<span class="typing-dot"></span><span class="typing-dot"></span><span class="typing-dot"></span>'; chatWindow.appendChild(div); scrollToBottom(); }
function removeTypingIndicator() { const el = document.getElementById('typing-indicator'); if (el) el.remove(); }
function scrollToBottom() { const chatWindow = document.getElementById('chat-window'); chatWindow.scrollTop = chatWindow.scrollHeight; }

async function callGemini(promptOrParts, isSystem = false) {
    const key = getApiKey();
    if (!key) {
        alert("APIキーが設定されていません。");
        return;
    }
    showTypingIndicator();
    try {
        let contents = chatSession.map(msg => ({ role: msg.role === 'user' ? 'user' : 'model', parts: [{ text: msg.text }] }));

        // Handle prompt (string or array of parts)
        if (Array.isArray(promptOrParts)) {
            contents.push({ role: 'user', parts: promptOrParts });
        } else {
            contents.push({ role: 'user', parts: [{ text: promptOrParts }] });
        }

        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${key}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ contents: contents }) });
        if (!response.ok) throw new Error('API Error');
        const data = await response.json();
        if (!data.candidates || data.candidates.length === 0) throw new Error('No response');
        const aiText = data.candidates[0].content?.parts?.[0]?.text;
        if (!aiText) throw new Error('Empty text');
        removeTypingIndicator();
        appendMessage('model', aiText);
    } catch (e) {
        console.error(e);
        removeTypingIndicator();
        appendMessage('model', 'エラーが発生しました。APIキーが正しいか確認してください。', false);
    }
}
function saveSummary(text) { const date = new Date().toLocaleDateString('ja-JP'); const summaryClean = text.replace('【まとめ】', '').trim(); const newInsight = { id: Date.now(), date: date, summary: summaryClean }; aiInsights.unshift(newInsight); localStorage.setItem('sukkiri_ai_insights', JSON.stringify(aiInsights)); setTimeout(() => { alert("振り返りを「気づきメモ」に保存しました！"); navigateTo('ai_chat'); }, 1500); }
window.deleteInsight = function (id) { if (confirm("削除しますか？")) { aiInsights = aiInsights.filter(i => i.id !== id); localStorage.setItem('sukkiri_ai_insights', JSON.stringify(aiInsights)); navigateTo('ai_chat'); } }

// --- Filter logic ---
window.toggleFilterCategory = function (c) { if (filterState.category === c) { filterState = { category: null, value: null } } else { filterState.category = c; filterState.value = null } renderHistory(document.getElementById('content')); }
window.setFilterValue = function (v) { if (filterState.value === v) { filterState.value = null } else { filterState.value = v } renderHistory(document.getElementById('content')); }
window.clearFilter = function () { filterState = { category: null, value: null }; renderHistory(document.getElementById('content')); }

// --- Helpers ---
window.resetData = function () {
    if (confirm("【重要】すべてのデータを削除して初期化しますか？\n\n・これまでの記録\n・プロフィール診断結果\n・AIとの会話ログ\n\nこれら全てが消去され、復元することはできません。")) {
        localStorage.removeItem('sukkiri_records_v4');
        localStorage.removeItem('sukkiri_profile_v1');
        localStorage.removeItem('sukkiri_ai_insights');
        localStorage.removeItem('sukkiri_last_transport');
        alert("データをリセットしました。");
        location.reload();
    }
}

let currentVideoFile = null;
let currentImageFile = null;
window.handleVideoPreview = function (input) { if (input.files[0]) { currentVideoFile = input.files[0]; const url = URL.createObjectURL(currentVideoFile); document.getElementById('video-preview').src = url; document.getElementById('video-preview-container').classList.remove('hidden'); document.getElementById('video-placeholder').classList.add('hidden'); } }
window.clearVideo = function () { currentVideoFile = null; document.getElementById('input-video').value = ''; document.getElementById('video-preview').src = ''; document.getElementById('video-preview-container').classList.add('hidden'); document.getElementById('video-placeholder').classList.remove('hidden'); }
window.handleImagePreview = function (input) { if (input.files[0]) { currentImageFile = input.files[0]; const url = URL.createObjectURL(currentImageFile); document.getElementById('image-preview').src = url; document.getElementById('image-preview-container').classList.remove('hidden'); document.getElementById('image-placeholder').classList.add('hidden'); } }
window.clearImage = function () { currentImageFile = null; document.getElementById('input-image').value = ''; document.getElementById('image-preview').src = ''; document.getElementById('image-preview-container').classList.add('hidden'); document.getElementById('image-placeholder').classList.remove('hidden'); }
window.updateRangeDisplay = function (val) {
    const num = parseInt(val);
    let e = '🙂';
    let c = "text-7xl font-bold text-teal-600 tracking-tighter"; // Base class for value

    if (num <= 30) {
        // e = '🙂';
        c = "text-7xl font-bold text-teal-600 tracking-tighter";
    } else if (num <= 50) {
        e = '😐';
        c = "text-7xl font-bold text-teal-700 tracking-tighter";
    } else if (num <= 70) {
        e = '😰';
        c = "text-7xl font-bold text-yellow-500 tracking-tighter";
    } else if (num <= 90) {
        e = '🤢';
        c = "text-7xl font-bold text-orange-500 tracking-tighter";
    } else {
        e = '🤮';
        c = "text-7xl font-bold text-red-600 tracking-tighter";
    }

    const emojiEl = document.getElementById('emoji-display');
    const levelEl = document.getElementById('level-display');

    if (emojiEl) emojiEl.innerText = e;
    if (levelEl) {
        levelEl.innerText = num;
        levelEl.className = c;
    }
}
window.fetchWeatherMock = function () { /* same */ const i = document.getElementById('weather-icon'); if (!i) return; const t = document.getElementById('weather-text'); const d = document.getElementById('weather-detail'); const inp = document.getElementById('input-weather'); setTimeout(() => { const ws = ['sunny', 'rain', 'cloudy']; const w = ws[Math.floor(Math.random() * ws.length)]; const dt = { sunny: { label: '晴れ', temp: '24℃', press: '1013hPa', icon: 'fa-sun', color: 'text-orange-400' }, rain: { label: '雨', temp: '19℃', press: '998hPa', icon: 'fa-cloud-rain', color: 'text-blue-500' }, cloudy: { label: '曇り', temp: '21℃', press: '1005hPa', icon: 'fa-cloud', color: 'text-gray-400' } }; const c = dt[w]; if (i) { i.innerHTML = `<i class="fa-solid ${c.icon}"></i>`; i.className = `w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm ${c.color}`; t.innerText = c.label; d.innerText = `${c.temp} / ${c.press}`; if (inp) inp.value = w; } }, 800); }

navigateTo('home');
