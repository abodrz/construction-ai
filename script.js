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

// ============ قاعدة بيانات المواد (محدثة لأسعار السوق السعودي 2026) ============
const materialsData = {
    structure: [
        { name: 'حديد تسليح', desc: 'حديد سابك / الراجحي درجة 60', price: '2,950', unit: 'طن', icon: 'fa-solid fa-bars' },
        { name: 'أسمنت بورتلاندي', desc: 'أسمنت عادي ومقاوم', price: '16.5', unit: 'كيس 50 كجم', icon: 'fa-solid fa-cube' },
        { name: 'بلوك أسمنتي معزول', desc: 'بلوك 20×20×40 معزول', price: '3.8', unit: 'حبة', icon: 'fa-solid fa-cubes' },
        { name: 'رمل ناعم مغسول', desc: 'رمل ناعم للخلطات واللياسة', price: '55', unit: 'متر مكعب', icon: 'fa-solid fa-mound' },
        { name: 'خرسانة جاهزة', desc: 'خرسانة C35 / B350 مقاومة', price: '250', unit: 'متر مكعب', icon: 'fa-solid fa-truck-ramp-box' },
        { name: 'عزل مائي وحراري', desc: 'لفائف بيتومين مع فوم بوليسترين', price: '55', unit: 'م²', icon: 'fa-solid fa-droplet-slash' }
    ],
    finish: [
        { name: 'سيراميك أرضيات', desc: 'سيراميك 60×60 نخب أول', price: '42', unit: 'م²', icon: 'fa-solid fa-square' },
        { name: 'بورسلان فاخر', desc: 'بورسلان إسباني / هندي فرز أول', price: '85', unit: 'م²', icon: 'fa-solid fa-gem' },
        { name: 'رخام طبيعي', desc: 'رخام روزا / عماني فرز أول', price: '240', unit: 'م²', icon: 'fa-solid fa-mountain' },
        { name: 'جرانيت طبيعي', desc: 'جرانيت أرضيات وواجهات', price: '210', unit: 'م²', icon: 'fa-solid fa-layer-group' },
        { name: 'دهانات جوتن / الجزيرة', desc: 'دهان جوتن فينوماستيك نص لمعة', price: '320', unit: 'برميل 18L', icon: 'fa-solid fa-paint-roller' },
        { name: 'جبس بورد أسقف', desc: 'ألواح جبسية شاملة التوريد والتركيب', price: '55', unit: 'م²', icon: 'fa-solid fa-expand' }
    ],
    doors: [
        { name: 'باب خشب رئيسي', desc: 'خشب زان طبيعي مقوى', price: '2,800', unit: 'حبة', icon: 'fa-solid fa-door-closed' },
        { name: 'باب غرف داخلي', desc: 'خشب HDF مع الإطار والمقبض', price: '750', unit: 'حبة', icon: 'fa-solid fa-door-open' },
        { name: 'نافذة ألومنيوم', desc: 'ألومنيوم دبل جلاس سرايا', price: '550', unit: 'م²', icon: 'fa-solid fa-window-maximize' },
        { name: 'باب حديد ليزر', desc: 'حديد مشغول ليزر للحوش', price: '1,800', unit: 'م²', icon: 'fa-solid fa-window-restore' },
        { name: 'شتر كهربائي', desc: 'شتر ألومنيوم مع محرك سومفي', price: '850', unit: 'م²', icon: 'fa-solid fa-blinds' },
        { name: 'باب ذكي', desc: 'قفل ذكي بصمة وكارت ورمز', price: '1,800', unit: 'حبة', icon: 'fa-solid fa-fingerprint' }
    ],
    plumbing: [
        { name: 'خزان مياه علوي', desc: 'خزان الزامل 4 طبقات 2000L', price: '1,100', unit: 'حبة', icon: 'fa-solid fa-droplet' },
        { name: 'سخان مياه الخزف', desc: 'سخان كهربائي 50 لتر', price: '420', unit: 'حبة', icon: 'fa-solid fa-temperature-high' },
        { name: 'مغسلة حمام مودرن', desc: 'مغسلة رخام صناعي مع الخلاط', price: '550', unit: 'طقم', icon: 'fa-solid fa-sink' },
        { name: 'كرسي حمام معلق', desc: 'كرسي أفرنجي جروهي معلق', price: '850', unit: 'حبة', icon: 'fa-solid fa-toilet' },
        { name: 'بانيو / دش مطري', desc: 'طقم شاور مع خلاط مخفي', price: '1,200', unit: 'طقم', icon: 'fa-solid fa-bath' },
        { name: 'مضخة مياه اتوماتيك', desc: 'مضخة سكالا 2 إيطالية', price: '1,450', unit: 'حبة', icon: 'fa-solid fa-faucet-drip' }
    ],
    electrical: [
        { name: 'لوحة توزيع كهرباء', desc: 'لوحة 24 خط الفنار / شنايدر', price: '850', unit: 'حبة', icon: 'fa-solid fa-table-cells' },
        { name: 'أسلاك كهرباء', desc: 'أسلاك نحاس الفنار 2.5 مم', price: '2.8', unit: 'متر', icon: 'fa-solid fa-plug-circle-bolt' },
        { name: 'مفتاح ذكي WiFi', desc: 'مفتاح تويا سمارت 3 أزرار', price: '110', unit: 'حبة', icon: 'fa-solid fa-toggle-on' },
        { name: 'سبوت لايت LED', desc: 'سبوت ضد الوهج 7-12 واط', price: '28', unit: 'حبة', icon: 'fa-solid fa-lightbulb' },
        { name: 'ثريا مودرن', desc: 'ثريا مودرن للصالة والمجلس', price: '1,200', unit: 'حبة', icon: 'fa-solid fa-chandelier' },
        { name: 'نظام طاقة شمسية', desc: 'نظام 5 كيلو واط شبكي', price: '22,000', unit: 'نظام كامل', icon: 'fa-solid fa-solar-panel' }
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

    // الأسعار الأساسية الواقعية في السوق السعودي (ريال/متر بناء مسطح)
    const baseRates = {
        villa: 1500,        // فيلا سكنية (عظم + تشطيب ديلوكس)
        duplex: 1450,       // دوبلكس
        apartment: 1350,    // شقة / عمارة سكنية
        building: 1650,     // عمارة تجارية سكنية
        commercial: 1850,   // مجمع تجاري
        warehouse: 950      // مستودع / هنجر
    };

    // معاملات التشطيب الواقعية
    const finishMultipliers = {
        economy: 0.70,     // اقتصادي (تجاري)
        standard: 1.0,      // ديلوكس (قياسي)
        luxury: 1.35,      // سوبر ديلوكس
        ultra: 1.70,       // ألترا لوكس VIP
        smart: 1.90        // منزل ذكي بالكامل
    };

    // معاملات المناطق المحدثة والواقعية بالسوق السعودي
    const regionMultipliers = {
        riyadh: 1.0,        // الرياض (المعيار الأساسي)
        hail: 0.92,         // حائل
        qassim: 0.93,       // القصيم (بريدة / عنيزة)
        jeddah: 1.04,       // جدة
        makkah: 1.08,       // مكة المكرمة
        madinah: 1.02,      // المدينة المنورة
        eastern: 0.98,      // المنطقة الشرقية والأحساء
        abha: 0.95,         // عسير وأبها وخميس مشيط
        tabuk: 0.96,        // تبوك ونيوم
        taif: 0.95,         // الطائف
        jouf: 0.91,         // الجوف والحدود الشمالية
        jazan: 0.93,        // جازان ونجران
        baha: 0.94,         // الباحة
        other: 0.94         // مناطق أخرى
    };

    // الحسابات
    const totalArea = area * floors;
    const baseRate = baseRates[type] || 1500;
    const finishMult = finishMultipliers[finish] || 1.0;
    const regionMult = regionMultipliers[region] || 1.0;

    // تكلفة العظم بالمواد (~42% من التكلفة الأساسية)
    const structureCost = Math.round(totalArea * baseRate * 0.42 * regionMult);

    // تكلفة التشطيب (~43% من التكلفة)
    const finishCost = Math.round(totalArea * baseRate * 0.43 * finishMult * regionMult);

    // تكلفة الكهرباء والسباكة والتكييف (~15%)
    const mecCost = Math.round(totalArea * baseRate * 0.15 * regionMult);

    // الإضافات بأسعار واقعية ومحدثة بالسوق السعودي
    let extrasCost = 0;
    if (hasBasement) extrasCost += area * 650;      // 650 ر.س للمتر المربع للقبو
    if (hasPool) extrasCost += 55000;              // 55,000 ر.س مسبح كامل
    if (hasElevator) extrasCost += 75000;           // 75,000 ر.س مصعد 3 وقفات كامل
    if (hasSolar) extrasCost += 22000;              // 22,000 ر.س طاقة شمسية 5KW
    if (hasSmartHome) extrasCost += 25000;          // 25,000 ر.س تأسيس سمارت هوم
    if (hasGarden) extrasCost += 20000;             // 20,000 ر.س تنسيق حوش وحديقة

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

// ============ محاكي البناء ثلاثي الأبعاد 3D ============
let constructionSimulatorInstance = null;

function initVideoModal() {
    const modal = document.getElementById('videoModal');
    const btn = document.getElementById('watchJourneyBtn');
    const navBtn = document.getElementById('nav3dBtn');
    const closeBtn = document.querySelector('.close-video-btn');
    const overlay = document.querySelector('.video-overlay');

    if (!modal) return;

    const openSimulator = () => {
        modal.classList.remove('hidden');
        document.body.style.overflow = 'hidden';

        // تهيئة محرك 3D عند أول فتح
        if (!constructionSimulatorInstance && typeof ConstructionSimulator3D !== 'undefined') {
            setTimeout(() => {
                constructionSimulatorInstance = new ConstructionSimulator3D('canvas3dContainer');
                initSimulatorControls();
            }, 100);
        } else if (constructionSimulatorInstance) {
            setTimeout(() => {
                constructionSimulatorInstance.onWindowResize();
            }, 150);
        }
    };

    if (btn) btn.addEventListener('click', openSimulator);
    if (navBtn) navBtn.addEventListener('click', openSimulator);

    const closeModal = () => {
        modal.classList.add('hidden');
        document.body.style.overflow = '';
        if (constructionSimulatorInstance && constructionSimulatorInstance.isAutoPlaying) {
            constructionSimulatorInstance.toggleAutoPlay();
        }
    };

    if (closeBtn) closeBtn.addEventListener('click', closeModal);
    if (overlay) overlay.addEventListener('click', closeModal);
}

function initSimulatorControls() {
    if (!constructionSimulatorInstance) return;

    // أزرار مراحل البناء
    const stageBtns = document.querySelectorAll('.stage-pill-btn');
    stageBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const stage = parseInt(btn.getAttribute('data-stage'), 10);
            if (constructionSimulatorInstance.isAutoPlaying) {
                constructionSimulatorInstance.toggleAutoPlay();
            }
            constructionSimulatorInstance.setStage(stage);
        });
    });

    // زر التشغيل التلقائي (التايم لابس)
    const autoPlayBtn = document.getElementById('btnAutoPlay3D');
    if (autoPlayBtn) {
        autoPlayBtn.addEventListener('click', () => {
            constructionSimulatorInstance.toggleAutoPlay();
        });
    }

    // زر التبديل الليلي والنهاري
    const dayNightBtn = document.getElementById('btnDayNight3D');
    if (dayNightBtn) {
        dayNightBtn.addEventListener('click', () => {
            constructionSimulatorInstance.toggleDayNight();
        });
    }

    // زر الأشعة السينية (X-Ray)
    const xRayBtn = document.getElementById('btnXRay3D');
    if (xRayBtn) {
        xRayBtn.addEventListener('click', () => {
            constructionSimulatorInstance.toggleXRay();
        });
    }

    // أزرار زوايا الكاميرا
    const camButtons = [
        { id: 'camIsoBtn', view: 'isometric' },
        { id: 'camDroneBtn', view: 'drone' },
        { id: 'camFrontBtn', view: 'front' },
        { id: 'camPoolBtn', view: 'pool' }
    ];

    camButtons.forEach(cb => {
        const el = document.getElementById(cb.id);
        if (el) {
            el.addEventListener('click', () => {
                document.querySelectorAll('.tool-icon-btn').forEach(b => b.classList.remove('active'));
                el.classList.add('active');
                constructionSimulatorInstance.setCameraView(cb.view);
            });
        }
    });

    const resetBtn = document.getElementById('camResetBtn');
    if (resetBtn) {
        resetBtn.addEventListener('click', () => {
            document.querySelectorAll('.tool-icon-btn').forEach(b => b.classList.remove('active'));
            const iso = document.getElementById('camIsoBtn');
            if (iso) iso.classList.add('active');
            constructionSimulatorInstance.resetCamera();
        });
    }
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
