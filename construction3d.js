/**
 * المعمار الذكي - محرك محاكاة البناء ثلاثي الأبعاد الواقعي (Realistic 3D Construction Simulator)
 * مطور بواسطة: عامر درزي العنزي
 * تقنية: Three.js (PBR Materials, Architectural Lighting & Environment)
 * متوافق بنسبة 100% مع GitHub Pages وبدون أي خوادم خارجية
 */

class ConstructionSimulator3D {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        if (!this.container) return;

        this.currentStage = 1;
        this.totalStages = 5;
        this.isNight = false;
        this.isXRay = false;
        this.isAutoPlaying = false;
        this.autoPlayInterval = null;

        this.stagesData = {
            1: {
                title: "المرحلة الأولى: تجهيز الموقع وأعمال الحفر والتمهيد",
                tag: "الأعمال الترابية والتمهيد",
                percent: 15,
                cost: "25,000 - 45,000 ر.س",
                duration: "2 - 3 أسابيع",
                materials: "حفر صخري، دمك تربة، صبة نظافة 10سم، سياج أمني مؤقت",
                tip: "احرص على إجراء اختبار فحص التربة (Soil Test) لتحديد منسوب التأسيس الآمن ونوعية القواعد بدقة."
            },
            2: {
                title: "المرحلة الثانية: القواعد والميدات والأساسات",
                tag: "الأساسات العميقة والسطحية",
                percent: 35,
                cost: "85,000 - 130,000 ر.س",
                duration: "3 - 5 أسابيع",
                materials: "خرسانة مقاومة للأملاح (SRC)، حديد تسليح عالي الشد، عزل مائي بيتوميني",
                tip: "العزل المائي للقواعد والميدات يحمي حديد التسليح من التآكل والأملاح الجوفية لعشرات السنين."
            },
            3: {
                title: "المرحلة الثالثة: الهيكل الإنشائي والأعمدة والأسقف",
                tag: "العظم الإنشائي",
                percent: 60,
                cost: "160,000 - 240,000 ر.س",
                duration: "8 - 12 أسبوع",
                materials: "خرسانة جاهزة K-350، حديد سابك 14-16 ملم، خشب بليود للصبة المعمارية",
                tip: "التأكد من رش الخرسانة بالماء مرتين يومياً لمدة 7 أيام متواصلة لضمان أقصى إجهاد ومتانة."
            },
            4: {
                title: "المرحلة الرابعة: أعمال البلوك والجدران والعوازل",
                tag: "المباني والتقسيمات المعمارية",
                percent: 80,
                cost: "70,000 - 110,000 ر.س",
                duration: "4 - 6 أسابيع",
                materials: "طابوق بركاني عازل للحرارة، شبك زوايا مجلفن، خلطة إسمنتية معالجة",
                tip: "استخدام البلوك البركاني المعزول يقلل استهلاك مكيفات الهواء في الصيف بنسبة تصل إلى 40%."
            },
            5: {
                title: "المرحلة الخامسة: التشطيبات الفاخرة والواجهات والمسبح",
                tag: "الواجهات المودرن واللاندسكيب الراقي",
                percent: 100,
                cost: "220,000 - 380,000 ر.س",
                duration: "10 - 16 أسبوع",
                materials: "رخام ترافنتينو بيج، بديل خشب خارجي WPC تيك، زجاج دبل جلاس عاكس، إضاءات LED مخفية",
                tip: "الواجهات الزجاجية البانورامية مع كاسرات الشمس الخشبية ورخام الترافنتينو تمنح فيلتك فخامة معمارية استثنائية."
            }
        };

        this.stageGroups = {};
        this.lights = {};
        this.materials = {};

        this.init();
    }

    init() {
        const width = this.container.clientWidth || 800;
        const height = this.container.clientHeight || 520;

        this.scene = new THREE.Scene();
        // خلفية سماوية هادئة واقعية للوضع النهاري
        this.scene.background = new THREE.Color(0xdce7f0);
        this.scene.fog = new THREE.FogExp2(0xdce7f0, 0.012);

        this.camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
        this.camera.position.set(22, 16, 24);

        this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
        this.renderer.setSize(width, height);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 1.05;

        const oldCanvas = this.container.querySelector('canvas');
        if (oldCanvas) oldCanvas.remove();
        this.container.appendChild(this.renderer.domElement);

        if (typeof THREE.OrbitControls !== 'undefined') {
            this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
            this.controls.enableDamping = true;
            this.controls.dampingFactor = 0.05;
            this.controls.maxPolarAngle = Math.PI / 2 - 0.03;
            this.controls.minDistance = 8;
            this.controls.maxDistance = 65;
            this.controls.target.set(0, 3.5, 0);
        }

        this.initMaterials();
        this.initLights();
        this.initEnvironment();
        this.buildAllStages();
        this.setStage(1);

        this.resizeHandler = this.onWindowResize.bind(this);
        window.addEventListener('resize', this.resizeHandler);

        this.animate = this.animate.bind(this);
        this.isDestroyed = false;
        requestAnimationFrame(this.animate);
    }

    initMaterials() {
        // خامات PBR واقعية بألوان طبيعية متناسقة هندسياً
        this.materials.dirt = new THREE.MeshStandardMaterial({ 
            color: 0x544438, 
            roughness: 0.95, 
            metalness: 0.02 
        });
        this.materials.sand = new THREE.MeshStandardMaterial({ 
            color: 0xd1be9d, 
            roughness: 0.9, 
            metalness: 0.0 
        });
        this.materials.concrete = new THREE.MeshStandardMaterial({ 
            color: 0x9fa5ad, 
            roughness: 0.8, 
            metalness: 0.08 
        });
        this.materials.concreteDark = new THREE.MeshStandardMaterial({ 
            color: 0x3d4147, 
            roughness: 0.85, 
            metalness: 0.1 
        });
        this.materials.rebar = new THREE.MeshStandardMaterial({ 
            color: 0x7a3a24, 
            roughness: 0.45, 
            metalness: 0.75 
        });
        this.materials.brick = new THREE.MeshStandardMaterial({ 
            color: 0xb54c2d, 
            roughness: 0.82, 
            metalness: 0.04 
        });
        // رخام ترافنتينو بيج طبيعي فخم للواجهات
        this.materials.travertine = new THREE.MeshStandardMaterial({ 
            color: 0xf5f0e6, 
            roughness: 0.38, 
            metalness: 0.03 
        });
        // بياض واجهات ناصع ومودرن
        this.materials.whitePlaster = new THREE.MeshStandardMaterial({ 
            color: 0xf0f0f2, 
            roughness: 0.65, 
            metalness: 0.02 
        });
        // إطارات رمادية أنثراسايت فخمة (Anthracite / Charcoal)
        this.materials.darkAccent = new THREE.MeshStandardMaterial({ 
            color: 0x22262d, 
            roughness: 0.32, 
            metalness: 0.28 
        });
        // خشب تيك طبيعي دافئ لكاسرات الشمس
        this.materials.wood = new THREE.MeshStandardMaterial({ 
            color: 0x7c4927, 
            roughness: 0.45, 
            metalness: 0.05 
        });
        // زجاج معماري بانورامي فخم عاكس
        this.materials.glass = new THREE.MeshPhysicalMaterial({
            color: 0x1d354a,
            transparent: true,
            opacity: 0.52,
            roughness: 0.08,
            metalness: 0.15,
            transmission: 0.82,
            ior: 1.52,
            reflectivity: 0.85
        });
        // درابزين زجاجي شفاف مع انعكاس رقيق
        this.materials.glassRailing = new THREE.MeshPhysicalMaterial({
            color: 0x244256,
            transparent: true,
            opacity: 0.4,
            roughness: 0.08,
            metalness: 0.1,
            transmission: 0.9,
            ior: 1.5
        });
        // مياه مسبح تركوازية كريستالية
        this.materials.water = new THREE.MeshPhysicalMaterial({
            color: 0x06b6d4,
            roughness: 0.12,
            metalness: 0.1,
            transmission: 0.75,
            opacity: 0.85,
            transparent: true,
            ior: 1.33
        });
        // عشب طبيعي نضر وحديقة خضراء
        this.materials.grass = new THREE.MeshStandardMaterial({ 
            color: 0x2d5c28, 
            roughness: 0.9, 
            metalness: 0.02 
        });
        // أرضيات وأرصفة إنترلوك وبازلت أنيقة
        this.materials.paving = new THREE.MeshStandardMaterial({ 
            color: 0x5a616d, 
            roughness: 0.75, 
            metalness: 0.08 
        });
        this.materials.pavingLight = new THREE.MeshStandardMaterial({ 
            color: 0xe8e4dc, 
            roughness: 0.5, 
            metalness: 0.05 
        });
        // إضاءات LED مخفية بدرجة 3000K دافئة
        this.materials.ledWarm = new THREE.MeshBasicMaterial({ color: 0xffe29a });
        this.materials.ledCyan = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
        // خامات وضع الأشعة X-Ray
        this.materials.xraySkeleton = new THREE.MeshBasicMaterial({ color: 0xff7b00 });
        this.materials.xrayWall = new THREE.MeshStandardMaterial({ 
            color: 0x0099ff, 
            wireframe: true, 
            transparent: true, 
            opacity: 0.35 
        });
    }

    initLights() {
        // إضاءة نصف كروية تحاكي انعكاس قبة السماء على الأرض (Sky + Ground bounce)
        this.lights.hemi = new THREE.HemisphereLight(0xf2f7fc, 0x4a5568, 0.8);
        this.scene.add(this.lights.hemi);

        // شمس رئيسية دافئة وناعمة
        this.lights.sun = new THREE.DirectionalLight(0xfffaf0, 1.35);
        this.lights.sun.position.set(24, 38, 20);
        this.lights.sun.castShadow = true;
        this.lights.sun.shadow.mapSize.width = 2048;
        this.lights.sun.shadow.mapSize.height = 2048;
        this.lights.sun.shadow.camera.near = 0.5;
        this.lights.sun.shadow.camera.far = 120;
        const d = 26;
        this.lights.sun.shadow.camera.left = -d;
        this.lights.sun.shadow.camera.right = d;
        this.lights.sun.shadow.camera.top = d;
        this.lights.sun.shadow.camera.bottom = -d;
        this.lights.sun.shadow.bias = -0.0004;
        this.scene.add(this.lights.sun);

        // إضاءة تعبئة ثانوية لمنع الظلال القاتمة المعتمة
        this.lights.fill = new THREE.DirectionalLight(0xa5b9ce, 0.35);
        this.lights.fill.position.set(-20, 16, -18);
        this.scene.add(this.lights.fill);

        // إضاءات معمارية موجهة للواجهة والمسبح (تنشط ليلاً)
        this.lights.villaSpot1 = new THREE.PointLight(0xffd166, 0, 18);
        this.lights.villaSpot1.position.set(2, 3.5, 6.5);
        this.scene.add(this.lights.villaSpot1);

        this.lights.villaSpot2 = new THREE.PointLight(0xffd166, 0, 18);
        this.lights.villaSpot2.position.set(-4, 3.5, 6.5);
        this.scene.add(this.lights.villaSpot2);

        this.lights.poolLight = new THREE.PointLight(0x38bdf8, 0, 14);
        this.lights.poolLight.position.set(6, 0.5, 2.5);
        this.scene.add(this.lights.poolLight);
    }

    initEnvironment() {
        const groundGeo = new THREE.PlaneGeometry(80, 80);
        this.groundMat = new THREE.MeshStandardMaterial({ color: 0xc8c3b7, roughness: 0.92 });
        this.ground = new THREE.Mesh(groundGeo, this.groundMat);
        this.ground.rotation.x = -Math.PI / 2;
        this.ground.position.y = -0.05;
        this.ground.receiveShadow = true;
        this.scene.add(this.ground);

        // شبكة مساحية رقيقة وأنيقة
        this.grid = new THREE.GridHelper(50, 50, 0x8898aa, 0xc2cbd6);
        this.grid.position.y = -0.04;
        this.scene.add(this.grid);
    }

    buildAllStages() {
        for (let i = 1; i <= 5; i++) {
            this.stageGroups[i] = new THREE.Group();
            this.scene.add(this.stageGroups[i]);
        }
        this.buildStage1();
        this.buildStage2();
        this.buildStage3();
        this.buildStage4();
        this.buildStage5();
    }

    buildStage1() {
        const group = this.stageGroups[1];
        
        // مجموعة العناصر المؤقتة لمرحلة الحفر (تختفي في المرحلة النهائية)
        this.stage1TempGroup = new THREE.Group();
        group.add(this.stage1TempGroup);

        const pitGeo = new THREE.BoxGeometry(17, 1.2, 15);
        const pitMesh = new THREE.Mesh(pitGeo, this.materials.dirt);
        pitMesh.position.set(0, -0.6, 0);
        pitMesh.receiveShadow = true;
        this.stage1TempGroup.add(pitMesh);

        for (let i = 0; i < 6; i++) {
            const moundGeo = new THREE.ConeGeometry(1.2 + Math.random() * 0.8, 1.2, 7);
            const mound = new THREE.Mesh(moundGeo, this.materials.sand);
            const angle = (i / 6) * Math.PI * 2;
            mound.position.set(Math.cos(angle) * 10.5, 0.6, Math.sin(angle) * 9);
            mound.castShadow = true;
            this.stage1TempGroup.add(mound);
        }

        // سياج أمني مع لوحات تحذيرية
        const fenceMat = new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.5, metalness: 0.3 });
        const fenceOffsets = [
            { x: 0, z: -8.8, w: 20, d: 0.1 },
            { x: 0, z: 8.8, w: 20, d: 0.1 },
            { x: -9.8, z: 0, w: 0.1, d: 17.6 },
            { x: 9.8, z: 0, w: 0.1, d: 17.6 }
        ];
        fenceOffsets.forEach(f => {
            const panel = new THREE.Mesh(new THREE.BoxGeometry(f.w, 1.6, f.d), fenceMat);
            panel.position.set(f.x, 0.8, f.z);
            panel.castShadow = true;
            this.stage1TempGroup.add(panel);
        });

        // جهاز المحطة الشاملة لمسح وتخطيط الموقع (Total Station)
        const tripodGroup = new THREE.Group();
        const legGeo = new THREE.CylinderGeometry(0.04, 0.04, 1.4);
        const legMat = new THREE.MeshStandardMaterial({ color: 0xd97706 });
        for (let a = 0; a < 3; a++) {
            const leg = new THREE.Mesh(legGeo, legMat);
            leg.position.set(Math.cos(a * 2.09) * 0.35, 0.7, Math.sin(a * 2.09) * 0.35);
            leg.rotation.z = Math.cos(a * 2.09) * 0.2;
            leg.rotation.x = Math.sin(a * 2.09) * 0.2;
            tripodGroup.add(leg);
        }
        const totalStation = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.35, 0.25), new THREE.MeshStandardMaterial({ color: 0x0284c7 }));
        totalStation.position.y = 1.45;
        tripodGroup.add(totalStation);
        tripodGroup.position.set(-8, 0, 6);
        this.stage1TempGroup.add(tripodGroup);
    }

    buildStage2() {
        const group = this.stageGroups[2];
        const blindingSlab = new THREE.Mesh(new THREE.BoxGeometry(15.5, 0.15, 13.5), this.materials.concreteDark);
        blindingSlab.position.set(0, 0.07, 0);
        blindingSlab.receiveShadow = true;
        group.add(blindingSlab);

        this.footingPositions = [
            { x: -5.5, z: -4.5 }, { x: 0, z: -4.5 }, { x: 5.5, z: -4.5 },
            { x: -5.5, z: 0 }, { x: 0, z: 0 }, { x: 5.5, z: 0 },
            { x: -5.5, z: 4.5 }, { x: 0, z: 4.5 }, { x: 5.5, z: 4.5 }
        ];

        this.footingPositions.forEach(p => {
            const footing = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.6, 1.8), this.materials.concrete);
            footing.position.set(p.x, 0.45, p.z);
            footing.castShadow = true;
            footing.receiveShadow = true;
            group.add(footing);

            const neck = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.8, 0.5), this.materials.concrete);
            neck.position.set(p.x, 1.05, p.z);
            neck.castShadow = true;
            group.add(neck);

            for (let r = 0; r < 4; r++) {
                const rebar = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 1.1), this.materials.rebar);
                const rx = (r % 2 === 0 ? -0.15 : 0.15);
                const rz = (r < 2 ? -0.15 : 0.15);
                rebar.position.set(p.x + rx, 1.7, p.z + rz);
                group.add(rebar);
            }
        });

        [-4.5, 0, 4.5].forEach(z => {
            const beam = new THREE.Mesh(new THREE.BoxGeometry(11.5, 0.5, 0.4), this.materials.concrete);
            beam.position.set(0, 0.9, z);
            beam.castShadow = true;
            group.add(beam);
        });
        [-5.5, 0, 5.5].forEach(x => {
            const beam = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.5, 9.5), this.materials.concrete);
            beam.position.set(x, 0.9, 0);
            beam.castShadow = true;
            group.add(beam);
        });
    }

    buildStage3() {
        const group = this.stageGroups[3];

        this.footingPositions.forEach(p => {
            const col = new THREE.Mesh(new THREE.BoxGeometry(0.55, 3.2, 0.55), this.materials.concrete);
            col.position.set(p.x, 2.7, p.z);
            col.castShadow = true;
            col.receiveShadow = true;
            group.add(col);
        });

        const slab1 = new THREE.Mesh(new THREE.BoxGeometry(14, 0.4, 12), this.materials.concrete);
        slab1.position.set(0, 4.5, 0);
        slab1.castShadow = true;
        slab1.receiveShadow = true;
        group.add(slab1);

        this.footingPositions.forEach(p => {
            if (p.x === 5.5 && p.z === 4.5) return;
            const col2 = new THREE.Mesh(new THREE.BoxGeometry(0.5, 3.0, 0.5), this.materials.concrete);
            col2.position.set(p.x, 6.2, p.z);
            col2.castShadow = true;
            group.add(col2);
        });

        const roofSlab = new THREE.Mesh(new THREE.BoxGeometry(14.4, 0.35, 12.4), this.materials.concrete);
        roofSlab.position.set(0, 7.85, 0);
        roofSlab.castShadow = true;
        group.add(roofSlab);

        const parapet = new THREE.Mesh(new THREE.BoxGeometry(14.4, 0.9, 0.3), this.materials.concrete);
        parapet.position.set(0, 8.45, -6.1);
        group.add(parapet);

        for (let s = 0; s < 10; s++) {
            const step = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.2, 0.35), this.materials.concrete);
            step.position.set(-4.2, 1.2 + s * 0.32, -2.5 + s * 0.32);
            step.castShadow = true;
            group.add(step);
        }
    }

    buildStage4() {
        const group = this.stageGroups[4];
        const wallMat = this.materials.brick;

        const backWall1 = new THREE.Mesh(new THREE.BoxGeometry(11, 3.2, 0.25), wallMat);
        backWall1.position.set(0, 2.7, -4.5);
        backWall1.castShadow = true;
        group.add(backWall1);

        const leftWall1 = new THREE.Mesh(new THREE.BoxGeometry(0.25, 3.2, 8.8), wallMat);
        leftWall1.position.set(-5.5, 2.7, 0);
        leftWall1.castShadow = true;
        group.add(leftWall1);

        const rightWall1 = new THREE.Mesh(new THREE.BoxGeometry(0.25, 3.2, 4), wallMat);
        rightWall1.position.set(5.5, 2.7, -2.2);
        rightWall1.castShadow = true;
        group.add(rightWall1);

        const frontWallLeft = new THREE.Mesh(new THREE.BoxGeometry(4.5, 3.2, 0.25), wallMat);
        frontWallLeft.position.set(-3.2, 2.7, 4.5);
        frontWallLeft.castShadow = true;
        group.add(frontWallLeft);

        const backWall2 = new THREE.Mesh(new THREE.BoxGeometry(11, 3.0, 0.25), wallMat);
        backWall2.position.set(0, 6.2, -4.5);
        backWall2.castShadow = true;
        group.add(backWall2);

        const leftWall2 = new THREE.Mesh(new THREE.BoxGeometry(0.25, 3.0, 8.8), wallMat);
        leftWall2.position.set(-5.5, 6.2, 0);
        leftWall2.castShadow = true;
        group.add(leftWall2);

        const frontUpperWall = new THREE.Mesh(new THREE.BoxGeometry(5.0, 3.0, 0.25), wallMat);
        frontUpperWall.position.set(-3.0, 6.2, 4.5);
        frontUpperWall.castShadow = true;
        group.add(frontUpperWall);

        const partition1 = new THREE.Mesh(new THREE.BoxGeometry(0.2, 3.2, 4.2), wallMat);
        partition1.position.set(0, 2.7, -2.2);
        group.add(partition1);

        const partition2 = new THREE.Mesh(new THREE.BoxGeometry(5.2, 3.0, 0.2), wallMat);
        partition2.position.set(2.6, 6.2, 0);
        group.add(partition2);
    }

    buildStage5() {
        const group = this.stageGroups[5];

        // 1. كتلة الرخام الترافنتينو للواجهة الأرضية
        const facadeStoneGround = new THREE.Mesh(new THREE.BoxGeometry(5.2, 3.3, 0.35), this.materials.travertine);
        facadeStoneGround.position.set(-3.2, 2.7, 4.6);
        facadeStoneGround.castShadow = true;
        group.add(facadeStoneGround);

        // 2. كتلة الواجهة العلوية الفاخرة (Travertine Cladding)
        const upperBox = new THREE.Mesh(new THREE.BoxGeometry(6.2, 3.2, 4.8), this.materials.travertine);
        upperBox.position.set(2.8, 6.2, 2.8);
        upperBox.castShadow = true;
        group.add(upperBox);

        // 3. كاسرات شمس خشبية مودرن (Vertical Teak Louvers)
        for (let l = 0; l < 16; l++) {
            const louver = new THREE.Mesh(new THREE.BoxGeometry(0.08, 3.0, 0.14), this.materials.wood);
            louver.position.set(0.2 + l * 0.34, 6.2, 5.25);
            louver.castShadow = true;
            group.add(louver);
        }

        // 4. الواجهة الزجاجية البانورامية بالدور الأرضي
        const glassWallGround = new THREE.Mesh(new THREE.BoxGeometry(4.8, 3.1, 0.08), this.materials.glass);
        glassWallGround.position.set(2.8, 2.7, 4.5);
        group.add(glassWallGround);

        // إطارات ألمنيوم أنثراسايت داكنة
        const frameMat = this.materials.darkAccent;
        const frameTop = new THREE.Mesh(new THREE.BoxGeometry(4.9, 0.12, 0.16), frameMat);
        frameTop.position.set(2.8, 4.2, 4.5);
        group.add(frameTop);

        const frameBottom = new THREE.Mesh(new THREE.BoxGeometry(4.9, 0.12, 0.16), frameMat);
        frameBottom.position.set(2.8, 1.2, 4.5);
        group.add(frameBottom);

        // 5. درابزين بلكونة الماستر الزجاجي الفاخر
        const glassRailing = new THREE.Mesh(new THREE.BoxGeometry(5.4, 1.0, 0.06), this.materials.glassRailing);
        glassRailing.position.set(-3.1, 5.1, 4.7);
        group.add(glassRailing);

        const railingCap = new THREE.Mesh(new THREE.BoxGeometry(5.45, 0.06, 0.08), frameMat);
        railingCap.position.set(-3.1, 5.6, 4.7);
        group.add(railingCap);

        // 6. مظلة برجولا السطح المودرن (Rooftop Pergola)
        const pergolaMat = this.materials.darkAccent;
        for (let p = 0; p < 8; p++) {
            const slat = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.18, 5.0), pergolaMat);
            slat.position.set(-4.5 + p * 0.7, 9.2, 1.5);
            slat.castShadow = true;
            group.add(slat);
        }
        const beamP1 = new THREE.Mesh(new THREE.BoxGeometry(5.2, 0.2, 0.15), pergolaMat);
        beamP1.position.set(-2.0, 9.1, 3.8);
        group.add(beamP1);
        const beamP2 = new THREE.Mesh(new THREE.BoxGeometry(5.2, 0.2, 0.15), pergolaMat);
        beamP2.position.set(-2.0, 9.1, -0.8);
        group.add(beamP2);

        // 7. مسبح إنفينيتي مودرن راقي (Infinity Pool)
        // إطار حوض المسبح من الترافنتينو
        const poolBorder = new THREE.Mesh(new THREE.BoxGeometry(6.6, 0.22, 4.6), this.materials.travertine);
        poolBorder.position.set(6.2, 0.11, 2.5);
        poolBorder.receiveShadow = true;
        group.add(poolBorder);

        // أرضية حوض المسبح الداخلية الزرقاء
        const poolBasin = new THREE.Mesh(new THREE.BoxGeometry(5.8, 0.2, 3.8), new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.2 }));
        poolBasin.position.set(6.2, 0.05, 2.5);
        group.add(poolBasin);

        // مياه المسبح الكريستالية اللامعة
        const poolWater = new THREE.Mesh(new THREE.BoxGeometry(5.8, 0.08, 3.8), this.materials.water);
        poolWater.position.set(6.2, 0.18, 2.5);
        group.add(poolWater);

        // 8. مسطحات خضراء ولاندسكيب (Lush Green Lawn)
        const grassLawn = new THREE.Mesh(new THREE.BoxGeometry(19, 0.1, 8.5), this.materials.grass);
        grassLawn.position.set(0, 0.06, 9.5);
        grassLawn.receiveShadow = true;
        group.add(grassLawn);

        // درجات رخامية كبيرة على العشب (Stepping Stones)
        for (let s = 0; s < 6; s++) {
            const stone = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.12, 0.9), this.materials.travertine);
            stone.position.set(-2.5, 0.13, 6.4 + s * 1.35);
            stone.castShadow = true;
            stone.receiveShadow = true;
            group.add(stone);
        }

        // أحواض أشجار وأشجار نخيل زينة معمارية
        const treePositions = [
            { x: -7.5, z: 8.5 },
            { x: -7.5, z: 12.0 },
            { x: 7.5, z: 12.0 }
        ];
        treePositions.forEach(tp => {
            const pot = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.4, 0.75, 12), this.materials.darkAccent);
            pot.position.set(tp.x, 0.42, tp.z);
            pot.castShadow = true;
            group.add(pot);

            const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.16, 3.2, 8), this.materials.wood);
            trunk.position.set(tp.x, 2.0, tp.z);
            trunk.castShadow = true;
            group.add(trunk);

            for (let f = 0; f < 6; f++) {
                const frond = new THREE.Mesh(new THREE.ConeGeometry(0.65, 1.8, 4), this.materials.grass);
                frond.position.set(tp.x + Math.cos(f * 1.05) * 0.65, 3.4, tp.z + Math.sin(f * 1.05) * 0.65);
                frond.rotation.z = Math.cos(f * 1.05) * 0.55;
                frond.rotation.x = Math.sin(f * 1.05) * 0.55;
                group.add(frond);
            }
        });

        // 9. سور الفيلا الخارجي المودرن الفخم (بديل سياج الحفر البرتقالي)
        this.boundaryWallGroup = new THREE.Group();
        group.add(this.boundaryWallGroup);

        // قاعدة سور الفيلا وأعمدة ترافنتينو
        const wallMat = this.materials.travertine;
        const louverFenceMat = this.materials.darkAccent;

        // سور يسار
        const wallLeft = new THREE.Mesh(new THREE.BoxGeometry(0.3, 2.2, 21), wallMat);
        wallLeft.position.set(-10.2, 1.1, 2.5);
        wallLeft.castShadow = true;
        this.boundaryWallGroup.add(wallLeft);

        // سور يمين
        const wallRight = new THREE.Mesh(new THREE.BoxGeometry(0.3, 2.2, 21), wallMat);
        wallRight.position.set(10.2, 1.1, 2.5);
        wallRight.castShadow = true;
        this.boundaryWallGroup.add(wallRight);

        // سور خلفي
        const wallBack = new THREE.Mesh(new THREE.BoxGeometry(20.7, 2.2, 0.3), wallMat);
        wallBack.position.set(0, 1.1, -8.0);
        wallBack.castShadow = true;
        this.boundaryWallGroup.add(wallBack);

        // سور أمامي مع بوابة فيلا مودرن
        const wallFrontL = new THREE.Mesh(new THREE.BoxGeometry(7.0, 2.0, 0.3), wallMat);
        wallFrontL.position.set(-6.6, 1.0, 13.6);
        wallFrontL.castShadow = true;
        this.boundaryWallGroup.add(wallFrontL);

        const wallFrontR = new THREE.Mesh(new THREE.BoxGeometry(7.0, 2.0, 0.3), wallMat);
        wallFrontR.position.set(6.6, 1.0, 13.6);
        wallFrontR.castShadow = true;
        this.boundaryWallGroup.add(wallFrontR);

        // بوابة المدخل المودرن (Anthracite modern gate)
        const gate = new THREE.Mesh(new THREE.BoxGeometry(4.0, 2.1, 0.1), louverFenceMat);
        gate.position.set(0, 1.05, 13.6);
        this.boundaryWallGroup.add(gate);

        // 10. خطوط إضاءة LED مخفية معمارية
        const ledStrip1 = new THREE.Mesh(new THREE.BoxGeometry(5.2, 0.06, 0.06), this.materials.ledWarm);
        ledStrip1.position.set(2.8, 4.55, 5.22);
        group.add(ledStrip1);

        const ledStrip2 = new THREE.Mesh(new THREE.BoxGeometry(14.4, 0.06, 0.06), this.materials.ledCyan);
        ledStrip2.position.set(0, 7.82, 6.22);
        group.add(ledStrip2);
    }

    setStage(stageNum) {
        this.currentStage = Math.max(1, Math.min(5, stageNum));

        for (let i = 1; i <= 5; i++) {
            const group = this.stageGroups[i];
            if (i <= this.currentStage) {
                if (!group.visible) {
                    group.visible = true;
                    group.position.y = -0.5;
                }
            } else {
                group.visible = false;
            }
        }

        // إخفاء عناصر الحفر المؤقتة والسياج البرتقالي في المرحلة النهائية 5
        if (this.stage1TempGroup) {
            this.stage1TempGroup.visible = (this.currentStage < 5);
        }

        // في المرحلة الخامسة: إظهار الفناء واللاندسكيب وإخفاء شبكة الحفر المساحية لجمال العرض
        if (this.grid) {
            this.grid.visible = (this.currentStage < 5);
        }

        // تكييف لون الأرضية المحيطة
        if (this.groundMat) {
            if (this.currentStage === 5) {
                this.groundMat.color.set(this.isNight ? 0x090e1a : 0xbed0c2); // محيط أخضر طبيعي
            } else {
                this.groundMat.color.set(this.isNight ? 0x080c16 : 0xc8c3b7); // تربة موقع بناء
            }
        }

        this.updateHUD();

        const buttons = document.querySelectorAll('.stage-pill-btn');
        buttons.forEach(btn => {
            const s = parseInt(btn.getAttribute('data-stage'), 10);
            if (s === this.currentStage) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
    }

    updateHUD() {
        const data = this.stagesData[this.currentStage];
        if (!data) return;

        const titleEl = document.getElementById('hudStageTitle');
        const tagEl = document.getElementById('hudStageTag');
        const percentEl = document.getElementById('hudStagePercent');
        const costEl = document.getElementById('hudStageCost');
        const durationEl = document.getElementById('hudStageDuration');
        const materialsEl = document.getElementById('hudStageMaterials');
        const tipEl = document.getElementById('hudStageTip');
        const progressBar = document.getElementById('hudProgressBar');

        if (titleEl) titleEl.innerText = data.title;
        if (tagEl) tagEl.innerText = data.tag;
        if (percentEl) percentEl.innerText = `${data.percent}%`;
        if (costEl) costEl.innerText = data.cost;
        if (durationEl) durationEl.innerText = data.duration;
        if (materialsEl) materialsEl.innerText = data.materials;
        if (tipEl) tipEl.innerText = data.tip;
        if (progressBar) progressBar.style.width = `${data.percent}%`;
    }

    toggleAutoPlay() {
        this.isAutoPlaying = !this.isAutoPlaying;
        const btn = document.getElementById('btnAutoPlay3D');

        if (this.isAutoPlaying) {
            if (btn) {
                btn.innerHTML = '<i class="fa-solid fa-pause"></i> إيقاف العرض';
                btn.classList.add('playing');
            }
            this.setStage(1);
            let nextStage = 2;

            this.autoPlayInterval = setInterval(() => {
                this.setStage(nextStage);
                nextStage++;
                if (nextStage > 5) {
                    nextStage = 1;
                }
            }, 3200);
        } else {
            if (btn) {
                btn.innerHTML = '<i class="fa-solid fa-play"></i> تشغيل البناء التلقائي';
                btn.classList.remove('playing');
            }
            if (this.autoPlayInterval) {
                clearInterval(this.autoPlayInterval);
                this.autoPlayInterval = null;
            }
        }
    }

    toggleDayNight() {
        this.isNight = !this.isNight;
        const btn = document.getElementById('btnDayNight3D');

        if (this.isNight) {
            // سماء ليلية فخمة
            this.scene.background.set(0x090f1d);
            this.scene.fog.color.set(0x090f1d);
            if (this.lights.hemi) this.lights.hemi.intensity = 0.22;
            this.lights.sun.intensity = 0.2;
            this.lights.sun.color.set(0x4361ee);

            // إنارة معمارية دافئة للواجهات والمسبح
            this.lights.villaSpot1.intensity = 2.6;
            this.lights.villaSpot2.intensity = 2.6;
            this.lights.poolLight.intensity = 3.2;

            if (this.groundMat) {
                this.groundMat.color.set(this.currentStage === 5 ? 0x090e1a : 0x080c16);
            }

            if (btn) btn.innerHTML = '<i class="fa-solid fa-sun"></i> الوضع النهاري';
        } else {
            // سماء نهارية معمارية صافية
            this.scene.background.set(0xdce7f0);
            this.scene.fog.color.set(0xdce7f0);
            if (this.lights.hemi) this.lights.hemi.intensity = 0.8;
            this.lights.sun.intensity = 1.35;
            this.lights.sun.color.set(0xfffaf0);

            this.lights.villaSpot1.intensity = 0;
            this.lights.villaSpot2.intensity = 0;
            this.lights.poolLight.intensity = 0;

            if (this.groundMat) {
                this.groundMat.color.set(this.currentStage === 5 ? 0xbed0c2 : 0xc8c3b7);
            }

            if (btn) btn.innerHTML = '<i class="fa-solid fa-moon"></i> الوضع الليلي';
        }
    }

        setSunTime(hour) {
        this.currentSunHour = parseFloat(hour);
        const t = Math.max(6, Math.min(18, this.currentSunHour));

        // إذا كان بالوضع الليلي، أعده للنهاري عند استخدام شريط الشمس
        if (this.isNight) {
            this.toggleDayNight();
        }

        // حساب زاوية مسار الشمس من الشرق (6 ص) إلى الغرب (6 م)
        const norm = (t - 6) / 12; // 0.0 إلى 1.0
        const angle = norm * Math.PI; // 0 إلى PI راديان

        // حساب إحداثيات الشمس القوسية في قبة السماء
        const sunX = Math.cos(angle) * 45;
        const sunY = Math.sin(angle) * 36 + 6;
        const sunZ = Math.sin(angle) * 16 + 18;

        if (this.lights.sun) {
            this.lights.sun.position.set(sunX, sunY, sunZ);

            if (t <= 8.5) {
                // شروق الشمس والصباح الباكر: ذهبي دافئ وظلال ممتدة غرباً
                const factor = (t - 6) / 2.5;
                this.lights.sun.color.set(0xffaf7a);
                this.lights.sun.intensity = 0.95 + factor * 0.4;
                this.scene.background.set(0xebdcd0);
                if (this.scene.fog) this.scene.fog.color.set(0xebdcd0);
            } else if (t >= 15.5) {
                // العصر وشفق الغروب: برتقالي عنبري دافئ وظلال ممتدة شرقاً
                const factor = (t - 15.5) / 2.5;
                this.lights.sun.color.set(0xff9944);
                this.lights.sun.intensity = 1.35 - factor * 0.45;
                this.scene.background.set(0xebdcd0);
                if (this.scene.fog) this.scene.fog.color.set(0xebdcd0);
            } else {
                // شمس الظهيرة الصافية: أبيض عاجي وإضاءة عمودية ساطعة
                this.lights.sun.color.set(0xfffaf0);
                this.lights.sun.intensity = 1.45;
                this.scene.background.set(0xdce7f0);
                if (this.scene.fog) this.scene.fog.color.set(0xdce7f0);
            }
        }
    }

toggleXRay() {
        this.isXRay = !this.isXRay;
        const btn = document.getElementById('btnXRay3D');

        this.stageGroups[4].traverse(child => {
            if (child.isMesh) {
                child.material = this.isXRay ? this.materials.xrayWall : this.materials.brick;
            }
        });

        this.stageGroups[5].traverse(child => {
            if (child.isMesh && child.material !== this.materials.glass && child.material !== this.materials.water) {
                if (!child.userData.originalMat) child.userData.originalMat = child.material;
                child.material = this.isXRay ? this.materials.xrayWall : child.userData.originalMat;
            }
        });

        this.stageGroups[2].traverse(child => {
            if (child.isMesh) {
                child.material = this.isXRay ? this.materials.xraySkeleton : this.materials.concrete;
            }
        });

        this.stageGroups[3].traverse(child => {
            if (child.isMesh) {
                child.material = this.isXRay ? this.materials.xraySkeleton : this.materials.concrete;
            }
        });

        if (btn) {
            btn.classList.toggle('active', this.isXRay);
        }
    }

    setCameraView(viewName) {
        if (!this.controls) return;

        const views = {
            isometric: { pos: [22, 16, 24], target: [0, 3.5, 0] },
            drone: { pos: [0, 34, 3], target: [0, 0, 0] },
            front: { pos: [0, 5, 24], target: [0, 4, 0] },
            pool: { pos: [12, 3.5, 9], target: [5, 2, 2] }
        };

        const view = views[viewName] || views.isometric;
        this.targetCamPos = new THREE.Vector3(...view.pos);
        this.targetCamLook = new THREE.Vector3(...view.target);
    }

    resetCamera() {
        this.setCameraView('isometric');
    }

    onWindowResize() {
        if (!this.container || !this.renderer || !this.camera) return;
        const width = this.container.clientWidth;
        const height = this.container.clientHeight;
        if (width === 0 || height === 0) return;

        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(width, height);
    }

    animate() {
        if (this.isDestroyed) return;
        requestAnimationFrame(this.animate);

        if (this.targetCamPos) {
            this.camera.position.lerp(this.targetCamPos, 0.05);
            if (this.controls && this.targetCamLook) {
                this.controls.target.lerp(this.targetCamLook, 0.05);
            }
            if (this.camera.position.distanceTo(this.targetCamPos) < 0.1) {
                this.targetCamPos = null;
                this.targetCamLook = null;
            }
        }

        if (this.isAutoPlaying && this.controls) {
            this.controls.autoRotate = true;
            this.controls.autoRotateSpeed = 1.2;
        } else if (this.controls) {
            this.controls.autoRotate = false;
        }

        for (let i = 1; i <= 5; i++) {
            const grp = this.stageGroups[i];
            if (grp && grp.visible && grp.position.y < 0) {
                grp.position.y += (0 - grp.position.y) * 0.15;
            }
        }

        if (this.controls) this.controls.update();
        this.renderer.render(this.scene, this.camera);
    }


    // ============ تخصيص المواد لحظياً في المشهد ثلاثي الأبعاد ============
    setFacadeCladding(type) {
        const colors = {
            travertine: { color: 0xf5f0e6, roughness: 0.38, metalness: 0.03 },
            calacatta: { color: 0xffffff, roughness: 0.22, metalness: 0.02 },
            anthracite: { color: 0x2a303c, roughness: 0.45, metalness: 0.2 },
            sandstone: { color: 0xe2cfa8, roughness: 0.65, metalness: 0.01 }
        };
        const c = colors[type] || colors.travertine;
        if (this.materials.travertine) {
            this.materials.travertine.color.set(c.color);
            this.materials.travertine.roughness = c.roughness;
            this.materials.travertine.metalness = c.metalness;
            this.materials.travertine.needsUpdate = true;
        }
    }

    setWoodFinish(type) {
        const woods = {
            teak: { color: 0x7c4927, roughness: 0.45 },
            walnut: { color: 0x3d2314, roughness: 0.4 },
            black: { color: 0x18181b, roughness: 0.3 }
        };
        const w = woods[type] || woods.teak;
        if (this.materials.wood) {
            this.materials.wood.color.set(w.color);
            this.materials.wood.roughness = w.roughness;
            this.materials.wood.needsUpdate = true;
        }
    }

    setPoolGlow(type) {
        const colors = {
            cyan: { water: 0x06b6d4, light: 0x38bdf8 },
            royal: { water: 0x1d4ed8, light: 0x3b82f6 },
            neon: { water: 0x9333ea, light: 0xc084fc },
            gold: { water: 0xd97706, light: 0xfde047 }
        };
        const p = colors[type] || colors.cyan;
        if (this.materials.water) {
            this.materials.water.color.set(p.water);
            this.materials.water.needsUpdate = true;
        }
        if (this.lights.poolLight) {
            this.lights.poolLight.color.set(p.light);
        }
    }

    destroy() {
        this.isDestroyed = true;
        if (this.autoPlayInterval) clearInterval(this.autoPlayInterval);
        window.removeEventListener('resize', this.resizeHandler);
        if (this.renderer && this.renderer.domElement) {
            this.renderer.domElement.remove();
        }
    }
}

window.ConstructionSimulator3D = ConstructionSimulator3D;
