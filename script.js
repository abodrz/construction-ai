/* ============================================
   المعمار الذكي - السكربت الرئيسي
   تطوير: عامر درزي العنزي
   ============================================ */

// ============ تسجيل Service Worker للـ PWA ============
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js')
            .then((registration) => {
                console.log('✅ Service Worker مسجل بنجاح:', registration.scope);
            })
            .catch((error) => {
                console.log('❌ فشل تسجيل Service Worker:', error);
            });
    });
}

// ============ تهيئة الصفحة ============
document.addEventListener('DOMContentLoaded', () => {
    initWelcomeModal();
    initCounters();
    initMaterialsGrid();
    initGallery();
    initFormHandler();
    initVideoModal();
    initCalendarButtons();
    initReportButton();
    initContractors();
});

// ============ نافذة الترحيب ============
function initWelcomeModal() {
    const modal = document.getElementById('welcomeModal');
    const btn = document.getElementById('welcomeBtn');

    btn.addEventListener('click', () => {
        modal.classList.add('hidden');
        // إزالة النافذة بعد انتهاء الأنيميشن
        setTimeout(() => {
            modal.style.display = 'none';
        }, 500);
    });

    // إغلاق بالضغط على أي مكان
    modal.addEventListener('click', (e) => {
        if (e.target === modal || e.target.classList.contains('welcome-overlay')) {
            modal.classList.add('hidden');
            setTimeout(() => {
                modal.style.display = 'none';
            }, 500);
        }
    });
}

// ============ عداد الأرقام المتحركة ============
function initCounters() {
    const counters = document.querySelectorAll('.stat-number');

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const target = parseInt(entry.target.dataset.count);
                animateCounter(entry.target, target);
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });

    counters.forEach(counter => observer.observe(counter));
}

function animateCounter(element, target) {
    let current = 0;
    const increment = target / 50;
    const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
            element.textContent = target.toLocaleString();
            clearInterval(timer);
        } else {
            element.textContent = Math.floor(current).toLocaleString();
        }
    }, 30);
}

// ============ قاعدة بيانات المواد ============
const materialsData = {
    structure: [
        { name: 'حديد تسليح', desc: 'حديد سابك درجة 60', price: '2,800', unit: 'طن', icon: 'fa-solid fa-bars' },
        { name: 'أسمنت', desc: 'أسمنت بورتلاندي عادي', price: '18', unit: 'كيس 50 كجم', icon: 'fa-solid fa-cube' },
        { name: 'بلوك أسمنتي', desc: 'بلوك 20×20×40', price: '2.5', unit: 'حبة', icon: 'fa-solid fa-cubes' },
        { name: 'رمل', desc: 'رمل ناعم للخلطات', price: '80', unit: 'متر مكعب', icon: 'fa-solid fa-mound' },
        { name: 'خرسانة جاهزة', desc: 'خرسانة B350', price: '280', unit: 'متر مكعب', icon: 'fa-solid fa-truck-ramp-box' },
        { name: 'عزل مائي', desc: 'لفائف بيتومين', price: '85', unit: 'م²', icon: 'fa-solid fa-droplet-slash' }
    ],
    finish: [
        { name: 'سيراميك أرضيات', desc: 'سيراميك 60×60 درجة أولى', price: '45', unit: 'م²', icon: 'fa-solid fa-square' },
        { name: 'بورسلان فاخر', desc: 'بورسلان إسباني لامع', price: '120', unit: 'م²', icon: 'fa-solid fa-gem' },
        { name: 'رخام طبيعي', desc: 'رخام كريما مارفيل', price: '350', unit: 'م²', icon: 'fa-solid fa-mountain' },
        { name: 'جرانيت', desc: 'جرانيت أسود جلاكسي', price: '280', unit: 'م²', icon: 'fa-solid fa-layer-group' },
        { name: 'دهانات جوتن', desc: 'دهان جوتن فينوماستيك', price: '380', unit: 'جالون', icon: 'fa-solid fa-paint-roller' },
        { name: 'جبس بورد', desc: 'ألواح جبس مع التركيب', price: '65', unit: 'م²', icon: 'fa-solid fa-expand' }
    ],
    doors: [
        { name: 'باب خشب رئيسي', desc: 'خشب زان طبيعي منحوت', price: '3,500', unit: 'حبة', icon: 'fa-solid fa-door-closed' },
        { name: 'باب غرف داخلي', desc: 'خشب HDF مع إطار', price: '850', unit: 'حبة', icon: 'fa-solid fa-door-open' },
        { name: 'نافذة ألومنيوم', desc: 'ألومنيوم دبل جلاس', price: '750', unit: 'م²', icon: 'fa-solid fa-window-maximize' },
        { name: 'باب حديد', desc: 'باب حديد مشغول للحوش', price: '2,800', unit: 'م²', icon: 'fa-solid fa-window-restore' },
        { name: 'شتر كهربائي', desc: 'شتر ألومنيوم مع موتور', price: '1,200', unit: 'م²', icon: 'fa-solid fa-blinds' },
        { name: 'باب ذكي', desc: 'باب ببصمة ورمز سري', price: '4,500', unit: 'حبة', icon: 'fa-solid fa-fingerprint' }
    ],
    plumbing: [
        { name: 'خزان مياه', desc: 'خزان بلاستيك 2000 لتر', price: '1,200', unit: 'حبة', icon: 'fa-solid fa-droplet' },
        { name: 'سخان مياه', desc: 'سخان كهربائي 50 لتر', price: '850', unit: 'حبة', icon: 'fa-solid fa-temperature-high' },
        { name: 'مغسلة حمام', desc: 'مغسلة سيراميك مع خلاط', price: '650', unit: 'طقم', icon: 'fa-solid fa-sink' },
        { name: 'كرسي حمام', desc: 'كرسي أفرنجي معلق', price: '1,100', unit: 'حبة', icon: 'fa-solid fa-toilet' },
        { name: 'بانيو', desc: 'بانيو أكريليك 170 سم', price: '1,800', unit: 'حبة', icon: 'fa-solid fa-bath' },
        { name: 'مضخة مياه', desc: 'مضخة 1 حصان أوتوماتيك', price: '950', unit: 'حبة', icon: 'fa-solid fa-faucet-drip' }
    ],
    electrical: [
        { name: 'لوحة توزيع', desc: 'لوحة 24 خط ABB', price: '1,200', unit: 'حبة', icon: 'fa-solid fa-table-cells' },
        { name: 'أسلاك كهرباء', desc: 'أسلاك نحاس 2.5 مم', price: '3.5', unit: 'متر', icon: 'fa-solid fa-plug-circle-bolt' },
        { name: 'مفتاح إضاءة ذكي', desc: 'مفتاح WiFi تحكم صوتي', price: '180', unit: 'حبة', icon: 'fa-solid fa-toggle-on' },
        { name: 'سبوت لايت', desc: 'سبوت LED 12 وات', price: '45', unit: 'حبة', icon: 'fa-solid fa-lightbulb' },
        { name: 'ثريا كريستال', desc: 'ثريا فاخرة 12 ذراع', price: '3,500', unit: 'حبة', icon: 'fa-solid fa-chandelier' },
        { name: 'نظام طاقة شمسية', desc: 'نظام 5 كيلو وات', price: '25,000', unit: 'نظام كامل', icon: 'fa-solid fa-solar-panel' }
    ]
};

function initMaterialsGrid() {
    const grid = document.getElementById('materialsGrid');
    const tabs = document.querySelectorAll('.mat-tab');

    // عرض الفئة الأولى
    displayMaterials('structure');

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            displayMaterials(tab.dataset.category);
        });
    });
}

function displayMaterials(category) {
    const grid = document.getElementById('materialsGrid');
    const materials = materialsData[category];

    grid.innerHTML = '';

    materials.forEach((mat, index) => {
        const card = document.createElement('div');
        card.className = 'material-card';
        card.style.animationDelay = `${index * 0.1}s`;
        card.innerHTML = `
            <div class="mat-icon"><i class="${mat.icon}"></i></div>
            <h4>${mat.name}</h4>
            <p>${mat.desc}</p>
            <div class="price">
                <span class="price-value">${mat.price} ر.س</span>
                <span class="unit">${mat.unit}</span>
            </div>
        `;
        grid.appendChild(card);
    });
}

// ============ معرض الصور ============
const galleryData = {
    exterior: [
        { url: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1200', label: 'واجهة فيلا عصرية' },
        { url: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1200', label: 'مدخل رئيسي فاخر' },
        { url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200', label: 'إضاءة ليلية مميزة' }
    ],
    living: [
        { url: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=1200', label: 'صالة استقبال واسعة' },
        { url: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=1200', label: 'غرفة معيشة عصرية' },
        { url: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=1200', label: 'مجلس عربي فاخر' }
    ],
    bedroom: [
        { url: 'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?w=1200', label: 'غرفة نوم رئيسية' },
        { url: 'https://images.unsplash.com/photo-1617325247661-675ab4b64ae2?w=1200', label: 'سرير ملكي فاخر' },
        { url: 'https://images.unsplash.com/photo-1540518614846-7eded433c457?w=1200', label: 'غرفة نوم مودرن' }
    ],
    kitchen: [
        { url: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=1200', label: 'مطبخ رخامي' },
        { url: 'https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=1200', label: 'مطبخ عصري مفتوح' },
        { url: 'https://images.unsplash.com/photo-1588854337236-6889d631faa8?w=1200', label: 'جزيرة مطبخ فاخرة' }
    ],
    bathroom: [
        { url: 'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=1200', label: 'حمام رخامي فاخر' },
        { url: 'https://images.unsplash.com/photo-1600566752355-35792bedcfea?w=1200', label: 'حمام رئيسي واسع' },
        { url: 'https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=1200', label: 'حمام مودرن' }
    ]
};

function initGallery() {
    const navBtns = document.querySelectorAll('.gallery-nav-btn');
    const mainImg = document.getElementById('mainGalleryImg');
    const label = document.getElementById('imageLabel');
    const thumbRow = document.getElementById('thumbnailRow');

    // عرض الغرفة الأولى
    updateGallery('exterior');

    navBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            navBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            updateGallery(btn.dataset.room);
        });
    });

    function updateGallery(room) {
        const images = galleryData[room];

        // تحديث الصورة الرئيسية
        mainImg.style.opacity = 0;
        setTimeout(() => {
            mainImg.src = images[0].url;
            label.textContent = images[0].label;
            mainImg.style.opacity = 1;
        }, 300);

        // تحديث الصور المصغرة
        thumbRow.innerHTML = '';
        images.forEach((img, index) => {
            const thumb = document.createElement('img');
            thumb.src = img.url.replace('w=1200', 'w=200');
            thumb.alt = img.label;
            thumb.className = index === 0 ? 'active' : '';

            thumb.addEventListener('click', () => {
                thumbRow.querySelectorAll('img').forEach(t => t.classList.remove('active'));
                thumb.classList.add('active');

                mainImg.style.opacity = 0;
                setTimeout(() => {
                    mainImg.src = img.url;
                    label.textContent = img.label;
                    mainImg.style.opacity = 1;
                }, 300);
            });

            thumbRow.appendChild(thumb);
        });
    }
}

// ============ نموذج حاسبة التكلفة ============
function initFormHandler() {
    const form = document.getElementById('constructionForm');

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        calculateCost();
    });
}

function calculateCost() {
    // جمع البيانات
    const type = document.getElementById('buildingType').value;
    const area = parseFloat(document.getElementById('area').value);
    const floors = parseInt(document.getElementById('floors').value);
    const finish = document.getElementById('finishLevel').value;
    const region = document.getElementById('region').value;

    // الإضافات
    const hasBasement = document.getElementById('basement').checked;
    const hasPool = document.getElementById('pool').checked;
    const hasElevator = document.getElementById('elevator').checked;
    const hasSolar = document.getElementById('solar').checked;
    const hasSmartHome = document.getElementById('smartHome').checked;
    const hasGarden = document.getElementById('garden').checked;

    if (!area || area < 50) {
        alert('الرجاء إدخال مساحة صحيحة (50 م² على الأقل)');
        return;
    }

    // الأسعار الأساسية (ريال/متر)
    const baseRates = {
        villa: 1600,
        duplex: 1500,
        apartment: 1400,
        building: 1800,
        commercial: 2000,
        warehouse: 1200
    };

    // معاملات التشطيب
    const finishMultipliers = {
        economy: 0.75,
        standard: 1.0,
        luxury: 1.4,
        ultra: 1.8,
        smart: 2.0
    };

    // معاملات المنطقة
    const regionMultipliers = {
        riyadh: 1.0,
        jeddah: 1.05,
        eastern: 0.95,
        makkah: 1.1,
        madinah: 1.08,
        other: 0.9
    };

    // الحسابات
    const totalArea = area * floors;
    const baseRate = baseRates[type];
    const finishMult = finishMultipliers[finish];
    const regionMult = regionMultipliers[region];

    // تكلفة العظم (40% من الإجمالي)
    const structureCost = Math.round(totalArea * baseRate * 0.4 * regionMult);

    // تكلفة التشطيب (35% من الإجمالي)
    const finishCost = Math.round(totalArea * baseRate * 0.35 * finishMult * regionMult);

    // تكلفة الكهرباء والسباكة (15%)
    const mecCost = Math.round(totalArea * baseRate * 0.15 * regionMult);

    // الإضافات
    let extrasCost = 0;
    if (hasBasement) extrasCost += area * 800;
    if (hasPool) extrasCost += 80000;
    if (hasElevator) extrasCost += 120000;
    if (hasSolar) extrasCost += 35000;
    if (hasSmartHome) extrasCost += 50000;
    if (hasGarden) extrasCost += 30000;

    const totalCost = structureCost + finishCost + mecCost + extrasCost;

    // المدة التقديرية
    const duration = Math.ceil((totalArea / 150) + 3 + (floors * 1.5));

    // عدد العمال
    const workers = Math.ceil(totalArea / 40) + 5;

    // عرض النتائج
    document.querySelector('.results-placeholder').style.display = 'none';
    document.getElementById('resultsContent').classList.remove('hidden');

    // تحديث القيم مع أنيميشن
    animateValue('totalCost', 0, totalCost, 1500);
    document.getElementById('structureCost').textContent = structureCost.toLocaleString() + ' ر.س';
    document.getElementById('finishCost').textContent = finishCost.toLocaleString() + ' ر.س';
    document.getElementById('mecCost').textContent = mecCost.toLocaleString() + ' ر.س';
    document.getElementById('extrasCost').textContent = extrasCost.toLocaleString() + ' ر.س';
    document.getElementById('duration').textContent = duration + ' شهر';
    document.getElementById('workers').textContent = workers + ' عامل';

    // التمرير للنتائج
    document.getElementById('resultsPanel').scrollIntoView({ behavior: 'smooth' });

    // حساب الكميات
    calculateQuantities(totalArea);
}

function calculateQuantities(area) {
    // معادلات محدثة (أكثر واقعية للسوق السعودي)
    // الحديد: متوسط 60-70 كجم للمتر المسطح (شامل القواعد والأعمدة والأسقف)
    const iron = (area * 65) / 1000;

    // البلوك: متوسط 40-50 بلوكة للمتر (شامل الجدران والهوردي والسور)
    const blocks = Math.ceil(area * 45);

    // الأسمنت: خرسانة + مباني + لياسة (حوالي 5-6 أكياس للمتر)
    const cement = Math.ceil(area * 5.5);

    // الرمل: للخرسانة واللياسة (0.25 متر مكعب تقريباً)
    const sand = Math.ceil(area * 0.25);

    // تحديث الواجهة
    animateValue('qtyIron', 0, iron, 1000);
    animateValue('qtyBlocks', 0, blocks, 1500);
    animateValue('qtyCement', 0, cement, 1500);
    animateValue('qtySand', 0, sand, 1000);
}

function animateValue(elementId, start, end, duration) {
    const element = document.getElementById(elementId);
    const range = end - start;
    const startTime = performance.now();

    function update(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const easeProgress = 1 - Math.pow(1 - progress, 3); // easeOutCubic
        const current = Math.floor(start + range * easeProgress);
        element.textContent = current.toLocaleString();

        if (progress < 1) {
            requestAnimationFrame(update);
        }
    }

    requestAnimationFrame(update);
}

// ============ التمرير السلس للروابط ============
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    });
});

// ============ تأثير الظهور عند التمرير ============
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const fadeObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// تطبيق على البطاقات والأقسام
document.querySelectorAll('.glass-card, .material-card, .tip-card, .timeline-item').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(30px)';
    el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    fadeObserver.observe(el);
});

// ============ نافذة الفيديو ============
function initVideoModal() {
    const modal = document.getElementById('videoModal');
    const btn = document.getElementById('watchJourneyBtn');
    const closeBtn = document.querySelector('.close-video-btn');
    const overlay = document.querySelector('.video-overlay');

    if (!btn || !modal) return;

    btn.addEventListener('click', () => {
        modal.classList.remove('hidden');
    });

    const closeModal = () => {
        modal.classList.add('hidden');
    };

    closeBtn.addEventListener('click', closeModal);
    overlay.addEventListener('click', closeModal);
}

// ============ تذكير التقويم ============
function initCalendarButtons() {
    const buttons = document.querySelectorAll('.btn-calendar');

    buttons.forEach(btn => {
        btn.addEventListener('click', () => {
            const stageName = btn.dataset.stage;
            const offsetDays = parseInt(btn.dataset.offset);

            // حساب التاريخ
            const date = new Date();
            date.setDate(date.getDate() + offsetDays);

            // تنسيق التاريخ لـ Google Calendar (YYYYMMDD)
            const isoDate = date.toISOString().replace(/-|:|\.\d\d\d/g, "");
            const startDate = isoDate.substring(0, 8);
            const endDate = isoDate.substring(0, 8); // نفس اليوم

            const title = `مرحلة البناء: ${stageName}`;
            const details = `تذكير ببدء مرحلة ${stageName} من مشروع منزلك - المعمار الذكي`;

            // رابط Google Calendar
            const url = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(title)}&dates=${startDate}/${endDate}&details=${encodeURIComponent(details)}`;

            window.open(url, '_blank');
        });
    });
}

// ============ زر التقرير ============
function initReportButton() {
    const btn = document.getElementById('downloadReportBtn');
    if (btn) {
        btn.addEventListener('click', () => {
            window.print();
        });
    }
}

// ============ دليل المقاولين ============
const contractorsData = [
    { name: 'مؤسسة العمران الحديث', specialty: 'مقاول عام', rating: 4.8, reviews: 120, initial: 'ع' },
    { name: 'فني كهرباء المحترفين', specialty: 'كهربائي', rating: 4.9, reviews: 85, initial: 'ك' },
    { name: 'السباكة الذهبية', specialty: 'سباك', rating: 4.7, reviews: 92, initial: 'س' },
    { name: 'دهانات الألوان', specialty: 'دهان', rating: 4.6, reviews: 64, initial: 'د' }
];

function initContractors() {
    renderContractors();
    initJoinModal();
}

function renderContractors() {
    const grid = document.getElementById('contractorsGrid');
    if (!grid) return;

    grid.innerHTML = '';
    contractorsData.forEach(cont => {
        const card = document.createElement('div');
        card.className = 'contractor-card glass-card';
        card.innerHTML = `
            <div class="contractor-header">
                <div class="contractor-avatar">${cont.initial}</div>
                <div class="contractor-info">
                    <h4>${cont.name}</h4>
                    <span class="specialty"><i class="fa-solid fa-briefcase"></i> ${cont.specialty}</span>
                </div>
            </div>
            <div class="contractor-body">
                <div class="rating">
                    <i class="fa-solid fa-star"></i>
                    <strong>${cont.rating}</strong>
                    <span>(${cont.reviews} تقييم)</span>
                </div>
                <button class="btn-hire" onclick="window.open('https://wa.me/966566620279?text=مرحباً، أرغب بالاستفسار عن خدماتك في منصة المعمار الذكي', '_blank')">
                    <i class="fa-brands fa-whatsapp"></i> تواصل معي
                </button>
            </div>
        `;
        grid.appendChild(card);
    });
}

function initJoinModal() {
    const modal = document.getElementById('contractorModal');
    const btn = document.getElementById('joinContractorBtn');
    const closeBtn = modal.querySelector('.close-modal-btn');
    const overlay = modal.querySelector('.modal-overlay');
    const form = document.getElementById('contractorForm');

    if (!btn || !modal) return;

    btn.addEventListener('click', () => modal.classList.remove('hidden'));

    const closeModal = () => modal.classList.add('hidden');
    closeBtn.addEventListener('click', closeModal);
    overlay.addEventListener('click', closeModal);

    form.addEventListener('submit', (e) => {
        e.preventDefault();

        const name = document.getElementById('contName').value;
        const specialty = document.getElementById('contSpecialty').value;
        const phone = document.getElementById('contPhone').value;

        // تجهيز رسالة الواتساب
        const message = `السلام عليكم، أرغب بالانضمام كـ (${specialty}) في منصة المعمار الذكي.\n\n👤 الاسم: ${name}\n📱 رقمي: ${phone}\n\nسأقوم بإرسال شهاداتي ونماذج أعمالي للتقييم.`;

        const whatsappUrl = `https://wa.me/966566620279?text=${encodeURIComponent(message)}`;

        // فتح الواتساب
        alert('سيتم تحويلك للواتساب الآن لإرسال طلب الانضمام...\n' + message);
        window.open(whatsappUrl, '_blank');

        // إغلاق وتصفير
        closeModal();
        form.reset();
    });
}
