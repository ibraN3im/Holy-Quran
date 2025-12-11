// Audio Player Application
class QuranPodcastPlayer {
    constructor() {
        this.audioFiles = [];
        this.currentTrack = null;
        this.isPlaying = false;
        this.currentFilter = 'all';
        this.favorites = this.loadFavorites();
        this.stats = this.loadStats();

        this.initializeElements();
        this.loadAudioFiles();
        this.setupEventListeners();
        this.updateStats();
        this.trackVisitor();
    }

    initializeElements() {
        // Audio elements
        this.audioPlayer = document.getElementById('audioPlayer');
        this.playBtn = document.getElementById('playBtn');
        this.prevBtn = document.getElementById('prevBtn');
        this.nextBtn = document.getElementById('nextBtn');
        this.volumeSlider = document.getElementById('volumeSlider');

        // Display elements
        this.currentTitle = document.getElementById('currentTitle');
        this.currentSurah = document.getElementById('currentSurah');
        this.currentTime = document.getElementById('currentTime');
        this.duration = document.getElementById('duration');
        this.progress = document.getElementById('progress');
        this.episodesGrid = document.getElementById('episodesGrid');
        this.totalTracks = document.getElementById('totalTracks');

        // Floating player elements
        this.floatingPlayer = document.getElementById('floatingPlayer');
        this.floatingTitle = document.getElementById('floatingTitle');
        this.floatingSurah = document.getElementById('floatingSurah');
        this.floatingPlay = document.getElementById('floatingPlay');
        this.floatingProgress = document.getElementById('floatingProgress');
        this.floatingProgressSlider = document.getElementById('floatingProgressSlider');
        this.floatingCurrentTime = document.getElementById('floatingCurrentTime');
        this.floatingDuration = document.getElementById('floatingDuration');
        this.floatingClose = document.getElementById('floatingClose');

        // Search elements
        this.searchInput = document.getElementById('searchInput');
        this.searchSection = document.getElementById('searchSection');
        this.searchToggle = document.getElementById('searchToggle');

        // Filter elements
        this.filterButtons = document.querySelectorAll('.filter-btn');

        // Theme toggle
        this.themeToggle = document.getElementById('themeToggle');

        // Favorites elements
        this.favoritesToggle = document.getElementById('favoritesToggle');
        this.favoritesSection = document.getElementById('favoritesSection');
        this.favoritesGrid = document.getElementById('favoritesGrid');
        this.clearFavoritesBtn = document.getElementById('clearFavoritesBtn');
        this.backToMainBtn = document.getElementById('backToMainBtn');

        // Scroll to top button
        this.scrollToTopBtn = document.getElementById('scrollToTopBtn');

        // Stats elements
        this.visitorCount = document.getElementById('visitorCount');
        this.listenCount = document.getElementById('listenCount');
        this.downloadCount = document.getElementById('downloadCount');
    }

    loadFavorites() {
        const saved = localStorage.getItem('quranFavorites');
        return saved ? JSON.parse(saved) : [];
    }

    saveFavorites() {
        localStorage.setItem('quranFavorites', JSON.stringify(this.favorites));
    }

    toggleFavorite(file) {
        const index = this.favorites.findIndex(f => f.id === file.id);
        if (index > -1) {
            this.favorites.splice(index, 1);
        } else {
            this.favorites.push(file);
        }
        this.saveFavorites();
        this.renderEpisodes(this.currentFilter, this.searchInput.value);
        this.renderFavorites();
    }

    isFavorite(file) {
        return this.favorites.some(f => f.id === file.id);
    }

    downloadFile(file) {
        const githubUrl = `https://raw.githubusercontent.com/your-username/your-repo/main/audio/${file.filename}`;

        fetch(githubUrl)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.blob();
            })
            .then(blob => {
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = file.filename;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                window.URL.revokeObjectURL(url);
                this.trackDownload();
                this.trackFileDownload(file.filename);
            })
            .catch(error => {
                console.error('Download failed:', error);
                this.showError('فشل في تحميل الملف');
            });
    }

    loadStats() {
        const saved = localStorage.getItem('quranStats');
        return saved ? JSON.parse(saved) : { visitors: 0, listens: 0, downloads: 0 };
    }

    saveStats() {
        localStorage.setItem('quranStats', JSON.stringify(this.stats));
    }

    trackVisitor() {
        const lastVisit = localStorage.getItem('lastVisit');
        const today = new Date().toDateString();

        if (lastVisit !== today) {
            this.stats.visitors++;
            localStorage.setItem('lastVisit', today);
            this.saveStats();
        }
        this.updateStats();
    }

    trackListen() {
        this.stats.listens++;
        this.saveStats();
        this.updateStats();
    }

    trackDownload() {
        this.stats.downloads++;
        this.saveStats();
        this.updateStats();
    }

    updateStats() {
        if (this.visitorCount) this.visitorCount.textContent = this.stats.visitors;
        if (this.listenCount) this.listenCount.textContent = this.stats.listens;
        if (this.downloadCount) this.downloadCount.textContent = this.stats.downloads;
    }

    renderFavorites() {
        this.favoritesGrid.innerHTML = '';

        if (this.favorites.length === 0) {
            this.favoritesGrid.innerHTML = '<div class="loading">لا توجد عناصر في المفضلة</div>';
            return;
        }

        this.favorites.forEach(file => {
            const episodeCard = this.createEpisodeCard(file);
            this.favoritesGrid.appendChild(episodeCard);
        });
    }

    async loadAudioFiles() {
        try {
            // Generate audio file data based on the directory listing
            this.audioFiles = this.generateAudioFileData();
            this.totalTracks.textContent = this.audioFiles.length;
            this.renderEpisodes();
            this.renderFavorites();
        } catch (error) {
            console.error('Error loading audio files:', error);
            this.showError('فشل في تحميل ملفات الصوت');
        }
    }

    generateAudioFileData() {
        const files = [
            '025Re1.mp3', '026Re1.mp3', '027Re1.mp3', '028Re1.mp3',
            '1-11Re1.mp3', '1-13Re1.mp3', '1-14Re1.mp3', '1-15Re1.mp3',
            '1-19Re1.mp3', '1-2Re1.mp3', '1-4Re1.mp3', '1-6Re1.mp3',
            '1-7Re1.mp3', '1-8Re1.mp3', '1-9Re1.mp3', '10-14Re1.mp3',
            '10-18Re1.mp3', '10-19Re1.mp3', '100-103Re1.mp3', '100-105Re1.mp3',
            '101-102Re1.mp3', '101-endRe1.mp3', '102-105Re1.mp3', '102-107Re1.mp3',
            '103-109Re1.mp3', '104-109Re1.mp3', '104-111Re1.mp3', '104Re1.mp3',
            '105-endRe1.mp3', '106-107Re1.mp3', '106-109Re1.mp3', '106-114Re1.mp3',
            '108-111Re1.mp3', '108-112Re1.mp3', '108-116Re1.mp3', '109-114Re1.mp3',
            '11-15Re1.mp3', '11-16Re1.mp3', '111-115Re1.mp3', '111-119Re1.mp3',
            '113-118Re1.mp3', '114-118Re1.mp3', '114-122Re1.mp3', '115-121Re1.mp3',
            '116-121Re1.mp3', '116-endRe1.mp3', '117-endRe1.mp3', '118-123Re1.mp3',
            '12-14Re1.mp3', '12-15Re1.mp3', '12-18Re1.mp3', '120-endRe1.mp3',
            '121-125Re1.mp3', '122-125Re1.mp3', '122-126Re1.mp3', '123-127Re1.mp3',
            '125-130Re1.mp3', '126-129Re1.mp3', '127-132Re1.mp3', '128-130Re1.mp3',
            '13-17Re1.mp3', '13-21Re1.mp3', '130-136Re1.mp3', '131-135Re1.mp3',
            '131-136Re1.mp3', '132-137Re1.mp3', '135-140Re1.mp3', '135-141Re1.mp3',
            '137-144Re1.mp3', '138-142Re1.mp3', '138-144Re1.mp3', '138-147Re1.mp3',
            '14-18Re1.mp3', '14-20Re1.mp3', '14-24Re1.mp3', '14-25Re1.mp3',
            '141-144Re1.mp3', '144-148Re1.mp3', '145-148Re1.mp3', '145-149Re1.mp3',
            '145-154Re1.mp3', '148-154Re1.mp3', '149-152Re1.mp3', '149-153Re1.mp3',
            '15-18Re1.mp3', '15-19Re1.mp3', '15-21Re1.mp3', '150-153Re1.mp3',
            '152-154Re1.mp3', '154-156Re1.mp3', '154-159Re1.mp3', '155-158Re1.mp3',
            '155-159Re1.mp3', '155-160Re1.mp3', '156-162Re1.mp3', '158-165Re1.mp3',
            '16-19Re1.mp3', '16-20Re1.mp3', '16-21Re1.mp3', '16-25Re1.mp3',
            '160-165Re1.mp3', '160-endRe1.mp3', '161-167Re1.mp3', '163-170Re1.mp3',
            '165-167Re1.mp3', '166-171Re1.mp3', '166-173Re1.mp3', '168-174Re1.mp3',
            '17-22Re1.mp3', '171-179Re1.mp3', '172-endRe1.mp3', '174-177Re1.mp3',
            '175-178Re1.mp3', '177-178Re1.mp3', '178-183Re1.mp3', '179-185Re1.mp3',
            '18-24Re1.mp3', '18-27Re1.mp3', '180-184Re1.mp3', '185-187Re1.mp3',
            '186-189Re1.mp3', '187-189Re1.mp3', '189-196Re1.mp3', '19-22Re1.mp3',
            '19-25Re1.mp3', '19-27Re1.mp3', '19-29Re1.mp3', '190-200Re1.mp3',
            '196-197Re1.mp3', '197Re1.mp3', '198-205Re1.mp3', '19Re1.mp3',
            '1Re1.mp3', '2-3Re1.mp3', '2-8Re1.mp3', '20-22Re1.mp3',
            '20-23Re1.mp3', '20-25Re1.mp3', '20-27Re1.mp3', '20-31Re1.mp3',
            '203-209Re1.mp3', '208-211Re1.mp3', '21-27Re1.mp3', '211-213Re1.mp3',
            '214-218Re1.mp3', '21Re1.mp3', '22-23Re1.mp3', '22-25Re1.mp3',
            '22-27Re1.mp3', '22-31Re1.mp3', '22-36Re1.mp3', '226-228Re1.mp3',
            '228-232Re1.mp3', '23-29Re1.mp3', '23-31Re1.mp3', '236-245Re1.mp3',
            '24-25Re1.mp3', '246-247Re1.mp3', '248-249Re1.mp3', '25-31Re1.mp3',
            '25-33Re1.mp3', '250-253Re1.mp3', '253-255Re1.mp3', '255-257Re1.mp3',
            '258-259Re1.mp3', '26-27Re1.mp3', '26-29Re1.mp3', '26-31Re1.mp3',
            '26-40Re1.mp3', '26-44Re1.mp3', '26-45Re1.mp3', '260-261Re1.mp3',
            '261-264Re1.mp3', '265-267Re1.mp3', '267-271Re1.mp3', '272-274Re1.mp3',
            '274-281Re1.mp3', '28-30Re1.mp3', '28-34Re1.mp3', '280-282Re1.mp3',
            '29-35Re1.mp3', '29-46Re1.mp3', '2Re1.mp3', '3-6Re1.mp3',
            '30-33Re1.mp3', '30-34Re1.mp3', '30-35Re1.mp3', '30-44Re1.mp3',
            '31-34Re1.mp3', '32-36Re1.mp3', '32-37Re1.mp3', '32-39Re1.mp3',
            '33-36Re1.mp3', '33-37Re1.mp3', '34-37Re1.mp3', '34-39Re1.mp3',
            '35-40Re1.mp3', '35-43Re1.mp3', '36-37Re1.mp3', '36-44Re1.mp3',
            '36-45Re1.mp3', '37-39Re1.mp3', '37-39Re1_2.mp3', '37-50Re1.mp3',
            '37-endRe1.mp3', '38-40Re1.mp3', '38-40Re1_2.mp3', '38-44Re1.mp3',
            '39-43Re1.mp3', '4-5Re1.mp3', '4-6Re1.mp3', '40-41Re1.mp3',
            '40-42Re1.mp3', '40-43Re1.mp3', '40-46Re1.mp3', '40-48Re1.mp3',
            '41-42Re1.mp3', '41-43Re1.mp3', '41-46Re1.mp3', '41-54Re1.mp3',
            '43-45Re1.mp3', '43-55Re1.mp3', '43-endRe1.mp3', '44-47Re1.mp3',
            '44-48Re1.mp3', '45-49Re1.mp3', '45-50Re1.mp3', '45-58Re1.mp3',
            '45-64Re1.mp3', '46-47Re1.mp3', '46-55Re1.mp3', '47-53Re1.mp3',
            '5-10Re1.mp3', '5-11Re1.mp3', '5-12Re1.mp3', '58-63Re1.mp3',
            '59-62Re1.mp3', '59-63Re1.mp3', '59-64Re1.mp3', '59-70Re1.mp3',
            '60-62Re1.mp3', '60-64Re1.mp3', '63-70Re1.mp3', '63-77Re1.mp3',
            '64-68Re1.mp3', '64-73Re1.mp3', '65-70Re1.mp3', '65-72Re1.mp3',
            '65-73Re1.mp3', '65-79Re1.mp3', '67-69Re1.mp3', '69-72Re1.mp3',
            '69-73Re1.mp3', '7-15Re1.mp3', '70-72Re1.mp3', '70-74Re1.mp3',
            '71-77Re1.mp3', '71-78Re1.mp3', '73-75Re1.mp3', '73-76Re1.mp3',
            'out1.mp3', 'out2.mp3'
        ];

        const uniqueFiles = [...new Set(files)];

        return uniqueFiles.map((filename, index) => {
            const title = this.generateTitle(filename);
            const surah = this.generateSurahInfo(filename);
            const type = filename.includes('-') ? 'range' : 'single';
            const duration = this.estimateDuration(filename);
            const fileStats = this.getFileStats(filename);

            return {
                id: index + 1,
                filename: filename,
                title: title,
                surah: surah,
                type: type,
                duration: duration,
                listens: fileStats.listens,
                downloads: fileStats.downloads,
                url: `audio/${filename}`
            };
        });
    }

    getFileStats(filename) {
        const savedStats = localStorage.getItem(`fileStats_${filename}`);
        if (savedStats) {
            return JSON.parse(savedStats);
        }
        return { listens: 0, downloads: 0 };
    }

    saveFileStats(filename, stats) {
        localStorage.setItem(`fileStats_${filename}`, JSON.stringify(stats));
    }

    trackFileListen(filename) {
        const stats = this.getFileStats(filename);
        stats.listens++;
        this.saveFileStats(filename, stats);
        this.updateFileInUI(filename, stats);
    }

    trackFileDownload(filename) {
        const stats = this.getFileStats(filename);
        stats.downloads++;
        this.saveFileStats(filename, stats);
        this.updateFileInUI(filename, stats);
    }

    updateFileInUI(filename, stats) {
        const file = this.audioFiles.find(f => f.filename === filename);
        if (file) {
            file.listens = stats.listens;
            file.downloads = stats.downloads;
            this.renderEpisodes(this.currentFilter, this.searchInput.value);
            this.renderFavorites();
        }
    }

    showError(message) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.textContent = message;
        errorDiv.style.cssText = `
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: linear-gradient(135deg, #e74c3c, #c0392b);
            color: white;
            padding: 1rem 2rem;
            border-radius: 25px;
            box-shadow: 0 8px 25px rgba(231, 76, 60, 0.4);
            z-index: 10000;
            font-weight: 500;
            animation: slideDown 0.3s ease;
        `;

        document.body.appendChild(errorDiv);

        setTimeout(() => {
            errorDiv.style.animation = 'slideUp 0.3s ease';
            setTimeout(() => {
                document.body.removeChild(errorDiv);
            }, 300);
        }, 3000);
    }

    generateTitle(filename) {
        const match = filename.match(/(\d+(?:-\d+)?(?:-end)?)Re1\.mp3/);
        if (match) {
            const surahRange = match[1];
            if (surahRange.includes('-end')) {
                return `تفسير ${surahRange.replace('-end', ' إلى النهاية')}`;
            } else if (surahRange.includes('-')) {
                return `تفسير ${surahRange.replace('-', ' إلى ')}`;
            } else {
                return `تفسير ${surahRange}`;
            }
        }
        return `تفسير - ${filename}`;
    }

    generateSurahInfo(filename) {
        return 'القارئ: الشيخ صديق احمد حمدون';
    }

    estimateDuration(filename) {
        // Estimate duration based on file size patterns
        const sizes = {
            '025Re1.mp3': '45:22',
            '026Re1.mp3': '67:08',
            '027Re1.mp3': '47:07',
            '028Re1.mp3': '42:58',
            '19Re1.mp3': '156:45',
            '21Re1.mp3': '147:18',
            '1Re1.mp3': '67:50',
            '2Re1.mp3': '56:55',
            'out1.mp3': '512:35',
            'out2.mp3': '245:12'
        };

        return sizes[filename] || '45:00';
    }

    renderEpisodes(filter = 'all', searchTerm = '') {
        let filteredFiles = this.audioFiles;

        // Apply filter
        if (filter !== 'all') {
            filteredFiles = filteredFiles.filter(file => file.type === filter);
        }

        // Enhanced search for ranges like "11-33" with debouncing
        if (searchTerm) {
            const cleanSearch = searchTerm.replace(/[^0-9-]/g, '');
            filteredFiles = filteredFiles.filter(file => {
                const filename = file.filename;
                const title = file.title.toLowerCase();
                const searchLower = searchTerm.toLowerCase();

                // Direct filename match
                if (filename.includes(cleanSearch)) {
                    return true;
                }

                // Range search (11-33 should match files containing 11-33, 11, 33, etc.)
                if (cleanSearch.includes('-')) {
                    const [start, end] = cleanSearch.split('-').filter(n => n);
                    if (start && filename.includes(start)) return true;
                    if (end && filename.includes(end)) return true;

                    // Check for range combinations
                    const rangePatterns = [
                        `${start}-${end}`,
                        `${start}Re1`,
                        `${end}Re1`,
                        `${start}-${end}Re1`
                    ];
                    if (rangePatterns.some(pattern => filename.includes(pattern))) {
                        return true;
                    }
                }

                // Title search
                if (title.includes(searchLower)) {
                    return true;
                }

                // Partial number matching
                if (cleanSearch.length >= 2 && filename.includes(cleanSearch)) {
                    return true;
                }

                return false;
            });
        }

        this.episodesGrid.innerHTML = '';

        if (filteredFiles.length === 0) {
            this.episodesGrid.innerHTML = '<div class="loading">لا توجد نتائج مطابقة</div>';
            return;
        }

        filteredFiles.forEach(file => {
            const episodeCard = this.createEpisodeCard(file);
            this.episodesGrid.appendChild(episodeCard);
        });
    }

    createEpisodeCard(file) {
        const card = document.createElement('div');
        card.className = 'episode-card';
        if (this.currentTrack && this.currentTrack.id === file.id) {
            card.classList.add('playing');
        }

        card.innerHTML = `

            <div class="episode-info">
                <div class="play-overlay">
                    <i class="fas fa-play"></i>
                </div>
                <div class="episode-title">${file.title}</div>
                <div class="episode-meta">
                    <span class="episode-duration">
                        <i class="fas fa-clock"></i>
                        ${file.duration}
                    </span>
                </div>
                <div class="episode-actions">
                    <button class="action-btn ${this.isFavorite(file) ? 'favorited' : ''}" data-id="${file.id}" data-action="favorite">
                        <i class="fas fa-heart"></i>
                        ${this.isFavorite(file) ? 'مفضلة' : 'لمفضلة'}
                    </button>
                    <button class="action-btn download" data-id="${file.id}" data-action="download">
                        <i class="fas fa-download"></i>
                        تحميل
                        <span class="download-stats">
                            <i class="fas fa-eye"></i> ${file.downloads}
                        </span>
                    </button>
                    <span class="listen-badge">
                        <i class="fas fa-play-circle"></i>
                        استماع
                    </span>
                </div>
            </div>
        `;

        card.addEventListener('click', (e) => {
            if (e.target.closest('.action-btn')) {
                const action = e.target.closest('.action-btn').dataset.action;
                const id = parseInt(e.target.closest('.action-btn').dataset.id);
                const file = this.audioFiles.find(f => f.id === id);

                if (action === 'favorite') {
                    this.toggleFavorite(file);
                } else if (action === 'download') {
                    this.downloadFile(file);
                }
            } else {
                this.playTrack(file);
            }
        });
        return card;
    }

    playTrack(file) {
        this.currentTrack = file;
        this.audioPlayer.src = file.url;
        this.currentTitle.textContent = file.title;
        this.currentSurah.textContent = file.surah;

        // Update floating player
        this.floatingTitle.textContent = file.title;
        this.floatingSurah.textContent = file.surah;
        this.floatingPlayer.classList.add('active');

        // Request picture-in-picture for mobile background playback
        if ('pictureInPictureEnabled' in document) {
            this.videoElement = document.createElement('video');
            this.videoElement.muted = true;
            this.videoElement.src = file.url;
            this.videoElement.play().then(() => {
                this.videoElement.requestPictureInPicture().catch(err => {
                    console.log('PiP not available:', err);
                });
            }).catch(err => {
                console.log('Video play failed:', err);
            });
        }

        this.audioPlayer.play();
        this.isPlaying = true;
        this.updatePlayButton();
        this.updateFloatingPlayButton();
        this.renderEpisodes(this.currentFilter, this.searchInput.value);
        this.trackListen();
        this.trackFileListen(file.filename);
    }

    updatePlayButton() {
        const icon = this.playBtn.querySelector('i');
        if (this.isPlaying) {
            icon.className = 'fas fa-pause';
        } else {
            icon.className = 'fas fa-play';
        }
    }

    updateFloatingPlayButton() {
        const icon = this.floatingPlay.querySelector('i');
        if (this.isPlaying) {
            icon.className = 'fas fa-pause';
        } else {
            icon.className = 'fas fa-play';
        }
    }

    setupEventListeners() {
        // Play/Pause button
        this.playBtn.addEventListener('click', () => {
            if (!this.currentTrack) {
                // Play first track if no current track
                if (this.audioFiles.length > 0) {
                    this.playTrack(this.audioFiles[0]);
                }
                return;
            }

            if (this.isPlaying) {
                this.audioPlayer.pause();
                this.isPlaying = false;
            } else {
                this.audioPlayer.play();
                this.isPlaying = true;
            }
            this.updatePlayButton();
            this.updateFloatingPlayButton();
        });

        // Previous button
        this.prevBtn.addEventListener('click', () => {
            if (!this.currentTrack) return;

            const currentIndex = this.audioFiles.findIndex(f => f.id === this.currentTrack.id);
            if (currentIndex > 0) {
                this.playTrack(this.audioFiles[currentIndex - 1]);
            }
        });

        // Next button
        this.nextBtn.addEventListener('click', () => {
            if (!this.currentTrack) return;

            const currentIndex = this.audioFiles.findIndex(f => f.id === this.currentTrack.id);
            if (currentIndex < this.audioFiles.length - 1) {
                this.playTrack(this.audioFiles[currentIndex + 1]);
            }
        });

        // Floating player controls
        this.floatingPlay.addEventListener('click', () => {
            this.playBtn.click();
        });

        // Floating progress slider
        this.floatingProgressSlider.addEventListener('input', (e) => {
            const seekTime = (e.target.value / 100) * this.audioPlayer.duration;
            this.audioPlayer.currentTime = seekTime;
        });

        this.floatingClose.addEventListener('click', () => {
            this.floatingPlayer.classList.remove('active');
        });

        // Volume control
        this.volumeSlider.addEventListener('input', (e) => {
            this.audioPlayer.volume = e.target.value / 100;
        });

        // Progress bar
        this.audioPlayer.addEventListener('timeupdate', () => {
            this.updateProgress();
        });

        this.updateProgress = () => {
            const { currentTime, duration } = this.audioPlayer;
            const progressPercent = (currentTime / duration) * 100;
            this.progress.style.width = `${progressPercent}%`;
            this.floatingProgress.style.width = `${progressPercent}%`;
            this.floatingProgressSlider.value = progressPercent;

            this.currentTime.textContent = this.formatTime(currentTime);
            this.floatingCurrentTime.textContent = this.formatTime(currentTime);
        };

        // Progress bar click
        document.querySelector('.progress-bar').addEventListener('click', (e) => {
            if (this.audioPlayer.duration) {
                const rect = e.currentTarget.getBoundingClientRect();
                const percent = (e.clientX - rect.left) / rect.width;
                this.audioPlayer.currentTime = percent * this.audioPlayer.duration;
            }
        });

        // Audio ended
        this.audioPlayer.addEventListener('ended', () => {
            const currentIndex = this.audioFiles.findIndex(f => f.id === this.currentTrack.id);
            if (currentIndex < this.audioFiles.length - 1) {
                this.playTrack(this.audioFiles[currentIndex + 1]);
            } else {
                this.isPlaying = false;
                this.updatePlayButton();
                this.updateFloatingPlayButton();
            }
        });

        // Search functionality
        this.searchToggle.addEventListener('click', () => {
            this.searchSection.style.display = this.searchSection.style.display === 'none' ? 'block' : 'none';
            if (this.searchSection.style.display === 'block') {
                this.searchInput.focus();
            }
        });

        this.searchInput.addEventListener('input', (e) => {
            const searchTerm = e.target.value.trim();
            this.renderEpisodes(this.currentFilter, searchTerm);
        });

        this.searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                const searchTerm = e.target.value.trim();
                this.renderEpisodes(this.currentFilter, searchTerm);
            }
        });

        // Filter buttons
        this.filterButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                this.filterButtons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.currentFilter = btn.dataset.filter;
                this.renderEpisodes(this.currentFilter, this.searchInput.value);
            });
        });

        // Theme toggle
        this.themeToggle.addEventListener('click', () => {
            document.body.classList.toggle('dark-theme');
            const icon = this.themeToggle.querySelector('i');
            if (document.body.classList.contains('dark-theme')) {
                icon.className = 'fas fa-sun';
            } else {
                icon.className = 'fas fa-moon';
            }
        });

        // Favorites toggle
        this.favoritesToggle.addEventListener('click', () => {
            const isFavoritesVisible = this.favoritesSection.style.display !== 'none';
            if (isFavoritesVisible) {
                this.favoritesSection.style.display = 'none';
                document.querySelector('.episodes-section').style.display = 'block';
            } else {
                this.favoritesSection.style.display = 'block';
                document.querySelector('.episodes-section').style.display = 'none';
                this.renderFavorites();
            }
        });

        // Clear favorites
        this.clearFavoritesBtn.addEventListener('click', () => {
            if (confirm('هل أنت متأكد من مسح جميع المفضلة؟')) {
                this.favorites = [];
                this.saveFavorites();
                this.renderFavorites();
                this.renderEpisodes(this.currentFilter, this.searchInput.value);
            }
        });

        // Back to main button
        this.backToMainBtn.addEventListener('click', () => {
            this.favoritesSection.style.display = 'none';
            document.querySelector('.episodes-section').style.display = 'block';
        });

        // Scroll to top button
        this.scrollToTopBtn.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });

        // Show/hide scroll to top button
        window.addEventListener('scroll', () => {
            if (window.scrollY > 300) {
                this.scrollToTopBtn.classList.add('visible');
            } else {
                this.scrollToTopBtn.classList.remove('visible');
            }
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.code === 'Space' && e.target.tagName !== 'INPUT') {
                e.preventDefault();
                this.playBtn.click();
            } else if (e.code === 'ArrowRight') {
                this.nextBtn.click();
            } else if (e.code === 'ArrowLeft') {
                this.prevBtn.click();
            }
        });

        // Handle page visibility for background playback
        document.addEventListener('visibilitychange', () => {
            if (document.hidden && this.currentTrack && this.isPlaying) {
                // Page is hidden, enable background playback
                this.enableBackgroundPlayback();
            } else if (!document.hidden && this.videoElement) {
                // Page is visible, close picture-in-picture
                if (document.pictureInPictureElement) {
                    document.exitPictureInPicture();
                }
            }
        });
    }

    formatTime(seconds) {
        const minutes = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${minutes}:${secs.toString().padStart(2, '0')}`;
    }

    showError(message) {
        this.episodesGrid.innerHTML = `<div class="loading">${message}</div>`;
    }

    enableBackgroundPlayback() {
        // Create a hidden video element for background playback
        if (!this.videoElement && this.currentTrack) {
            this.videoElement = document.createElement('video');
            this.videoElement.muted = false;
            this.videoElement.src = this.currentTrack.url;
            this.videoElement.style.display = 'none';
            document.body.appendChild(this.videoElement);

            this.videoElement.play().then(() => {
                if ('pictureInPictureEnabled' in document && !document.pictureInPictureElement) {
                    this.videoElement.requestPictureInPicture().catch(err => {
                        console.log('PiP request failed:', err);
                    });
                }
            }).catch(err => {
                console.log('Background playback failed:', err);
                // Fallback: keep audio playing in background
                this.audioPlayer.play().catch(audioErr => {
                    console.log('Audio background play failed:', audioErr);
                });
            });
        }
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new QuranPodcastPlayer();
});
