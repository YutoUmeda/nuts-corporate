/**
 * 株式会社Nuts コーポレートサイト メインJavaScript
 * 軽量でアクセシブルなインタラクション
 */

(function() {
    'use strict';

    // ========== DOM要素の取得 ==========
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const nav = document.querySelector('.nav');
    const navLinks = document.querySelectorAll('.nav-link');
    const contactForm = document.querySelector('.contact-form-element');
    
    // ========== モバイルメニューの制御 ==========
    
    /**
     * モバイルメニューの開閉
     */
    function toggleMobileMenu() {
        const isOpen = mobileMenuBtn.getAttribute('aria-expanded') === 'true';
        
        // ARIA属性の更新
        mobileMenuBtn.setAttribute('aria-expanded', !isOpen);
        mobileMenuBtn.setAttribute('aria-label', isOpen ? 'メニューを開く' : 'メニューを閉じる');
        
        // メニューの表示/非表示
        nav.classList.toggle('active');
        
        // ボディのスクロール制御（メニュー開時はスクロール無効）
        if (!isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
    }
    
    /**
     * モバイルメニューを閉じる
     */
    function closeMobileMenu() {
        mobileMenuBtn.setAttribute('aria-expanded', 'false');
        mobileMenuBtn.setAttribute('aria-label', 'メニューを開く');
        nav.classList.remove('active');
        document.body.style.overflow = '';
    }
    
    // モバイルメニューボタンのクリックイベント
    if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener('click', toggleMobileMenu);
    }
    
    // ナビゲーションリンクのクリックでメニューを閉じる
    navLinks.forEach(link => {
        link.addEventListener('click', closeMobileMenu);
    });
    
    // ESCキーでメニューを閉じる
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && nav && nav.classList.contains('active')) {
            closeMobileMenu();
        }
    });
    
    // メニュー外をクリックしたらメニューを閉じる
    document.addEventListener('click', function(e) {
        if (nav && nav.classList.contains('active') && 
            !nav.contains(e.target) && 
            !mobileMenuBtn.contains(e.target)) {
            closeMobileMenu();
        }
    });
    
    // リサイズ時にメニューを閉じる（デスクトップ表示時）
    window.addEventListener('resize', function() {
        if (window.innerWidth >= 768 && nav && nav.classList.contains('active')) {
            closeMobileMenu();
        }
    });
    
    // ========== フォームバリデーション ==========
    
    /**
     * フォームバリデーション関数
     */
    const formValidation = {
        // バリデーションルール
        rules: {
            name: {
                required: true,
                minLength: 1,
                message: 'お名前を入力してください'
            },
            email: {
                required: true,
                pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                message: '正しいメールアドレスを入力してください'
            },
            phone: {
                required: true,
                pattern: /^[\d\-\+\(\)\s]+$/,
                minLength: 10,
                message: '正しい電話番号を入力してください（例：03-1234-5678）'
            },
            message: {
                required: true,
                minLength: 10,
                message: 'お問い合わせ内容を10文字以上入力してください'
            },
            privacy: {
                required: true,
                message: 'プライバシーポリシーに同意してください'
            }
        },
        
        /**
         * 単一フィールドのバリデーション
         */
        validateField: function(field) {
            const fieldName = field.name;
            const fieldValue = field.value.trim();
            const rule = this.rules[fieldName];
            const formGroup = field.closest('.form-group') || field.closest('.form-privacy');
            const errorElement = formGroup.querySelector('.error-message');
            
            if (!rule) return true;
            
            let isValid = true;
            let errorMessage = '';
            
            // 必須チェック
            if (rule.required) {
                if (field.type === 'checkbox') {
                    isValid = field.checked;
                } else {
                    isValid = fieldValue.length > 0;
                }
                if (!isValid) {
                    errorMessage = rule.message;
                }
            }
            
            // 最小文字数チェック
            if (isValid && rule.minLength && fieldValue.length < rule.minLength) {
                isValid = false;
                errorMessage = rule.message;
            }
            
            // パターンチェック（正規表現）
            if (isValid && rule.pattern && !rule.pattern.test(fieldValue)) {
                isValid = false;
                errorMessage = rule.message;
            }
            
            // UI更新
            this.updateFieldUI(field, formGroup, errorElement, isValid, errorMessage);
            
            return isValid;
        },
        
        /**
         * フィールドUIの更新
         */
        updateFieldUI: function(field, formGroup, errorElement, isValid, errorMessage) {
            // ARIA属性の更新
            field.setAttribute('aria-invalid', isValid ? 'false' : 'true');
            
            // エラーメッセージの表示/非表示
            if (errorElement) {
                if (isValid) {
                    errorElement.textContent = '';
                    errorElement.classList.remove('show');
                    formGroup.classList.remove('error');
                } else {
                    errorElement.textContent = errorMessage;
                    errorElement.classList.add('show');
                    formGroup.classList.add('error');
                }
            }
            
            // 成功状態の表示
            if (isValid && field.value.trim()) {
                formGroup.classList.add('success');
            } else {
                formGroup.classList.remove('success');
            }
        },
        
        /**
         * フォーム全体のバリデーション
         */
        validateForm: function(form) {
            const formElements = form.querySelectorAll('input, textarea, select');
            let isValid = true;
            
            formElements.forEach(field => {
                // ハニーポット（スパム対策）フィールドは除外
                if (field.name === 'website') return;
                
                if (!this.validateField(field)) {
                    isValid = false;
                }
            });
            
            return isValid;
        }
    };
    
    // ========== フォームイベントの設定 ==========
    
    if (contactForm) {
        // リアルタイムバリデーション
        const formFields = contactForm.querySelectorAll('input, textarea, select');
        
        formFields.forEach(field => {
            // ハニーポット（スパム対策）フィールドは除外
            if (field.name === 'website') return;
            
            // フィールド離脱時のバリデーション
            field.addEventListener('blur', function() {
                formValidation.validateField(this);
            });
            
            // 入力中のエラー解除（エラー状態の場合のみ）
            field.addEventListener('input', function() {
                const formGroup = this.closest('.form-group') || this.closest('.form-privacy');
                if (formGroup && formGroup.classList.contains('error')) {
                    // 少し遅延させてからバリデーション実行（ユーザビリティ向上）
                    setTimeout(() => {
                        formValidation.validateField(this);
                    }, 300);
                }
            });
        });
        
        // フォーム送信時のバリデーション
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // スパム対策：ハニーポットフィールドがチェック
            const honeypot = this.querySelector('input[name="website"]');
            if (honeypot && honeypot.value) {
                // スパムの可能性があるため送信を拒否（ユーザーには表示しない）
                return false;
            }
            
            // フォームバリデーション実行
            const isValid = formValidation.validateForm(this);
            
            if (isValid) {
                // バリデーション成功
                this.classList.add('loading');
                const submitBtn = this.querySelector('#submit-btn');
                const originalText = submitBtn.textContent;
                
                submitBtn.disabled = true;
                submitBtn.textContent = '送信中...';
                
                // 実際の送信処理
                // mailto版の場合はそのまま送信
                // Formspree版の場合はここでAjax送信も可能
                if (this.action.startsWith('mailto:')) {
                    // mailto版：デフォルトの動作を実行
                    setTimeout(() => {
                        this.classList.remove('loading');
                        submitBtn.disabled = false;
                        submitBtn.textContent = originalText;
                        alert('メールソフトが起動します。送信を完了してください。');
                    }, 1000);
                    
                    // デフォルトの送信を実行
                    this.submit();
                } else {
                    // Formspree版や他のサービス用の処理
                    // 実際のプロジェクトでは適切なAjax処理を実装
                    setTimeout(() => {
                        this.classList.remove('loading');
                        submitBtn.disabled = false;
                        submitBtn.textContent = originalText;
                        alert('お問い合わせを受け付けました。ありがとうございます。');
                        this.reset();
                    }, 2000);
                }
            } else {
                // バリデーション失敗：最初のエラーフィールドにフォーカス
                const firstErrorField = this.querySelector('[aria-invalid="true"]');
                if (firstErrorField) {
                    firstErrorField.focus();
                    
                    // スクリーンリーダー用のアナウンス
                    const errorMessage = document.createElement('div');
                    errorMessage.className = 'sr-only';
                    errorMessage.setAttribute('aria-live', 'polite');
                    errorMessage.textContent = '入力内容にエラーがあります。修正してから再度送信してください。';
                    document.body.appendChild(errorMessage);
                    
                    setTimeout(() => {
                        document.body.removeChild(errorMessage);
                    }, 1000);
                }
            }
        });
    }
    
    // ========== スムーススクロール ==========
    
    /**
     * アンカーリンクのスムーススクロール
     * （CSS scroll-behavior: smooth で対応済みだが、IE対応版）
     */
    document.addEventListener('click', function(e) {
        const target = e.target.closest('a[href^="#"]');
        if (!target) return;
        
        const href = target.getAttribute('href');
        if (href === '#') return;
        
        const targetElement = document.querySelector(href);
        if (!targetElement) return;
        
        e.preventDefault();
        
        // ヘッダーの高さを考慮したオフセット
        const headerHeight = document.querySelector('.header').offsetHeight;
        const offsetTop = targetElement.offsetTop - headerHeight - 20;
        
        window.scrollTo({
            top: offsetTop,
            behavior: 'smooth'
        });
        
        // フォーカス管理
        targetElement.focus();
    });
    
    // ========== パフォーマンス最適化 ==========
    
    /**
     * 画像の遅延読み込み（Intersection Observer使用）
     */
    function setupLazyLoading() {
        const images = document.querySelectorAll('img[data-src]');
        if (!images.length) return;
        
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.classList.remove('lazy');
                    observer.unobserve(img);
                }
            });
        });
        
        images.forEach(img => imageObserver.observe(img));
    }
    
    // Intersection Observerがサポートされている場合のみ実行
    if ('IntersectionObserver' in window) {
        setupLazyLoading();
    }
    
    // ========== アクセシビリティサポート ==========
    
    /**
     * キーボードナビゲーション改善
     */
    document.addEventListener('keydown', function(e) {
        // Tabキーでのフォーカス移動の可視化
        if (e.key === 'Tab') {
            document.body.classList.add('keyboard-navigation');
        }
    });
    
    // マウスクリックでキーボードナビゲーション表示を解除
    document.addEventListener('mousedown', function() {
        document.body.classList.remove('keyboard-navigation');
    });
    
    /**
     * フォーカストラップ（モーダルなどで使用）
     */
    function trapFocus(element) {
        const focusableElements = element.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        const firstFocusable = focusableElements[0];
        const lastFocusable = focusableElements[focusableElements.length - 1];
        
        element.addEventListener('keydown', function(e) {
            if (e.key === 'Tab') {
                if (e.shiftKey) {
                    if (document.activeElement === firstFocusable) {
                        lastFocusable.focus();
                        e.preventDefault();
                    }
                } else {
                    if (document.activeElement === lastFocusable) {
                        firstFocusable.focus();
                        e.preventDefault();
                    }
                }
            }
        });
    }
    
    // ========== ユーティリティ関数 ==========
    
    /**
     * デバウンス関数（パフォーマンス向上）
     */
    function debounce(func, wait, immediate) {
        let timeout;
        return function executedFunction() {
            const context = this;
            const args = arguments;
            const later = function() {
                timeout = null;
                if (!immediate) func.apply(context, args);
            };
            const callNow = immediate && !timeout;
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
            if (callNow) func.apply(context, args);
        };
    }
    
    /**
     * ページ読み込み完了時の処理
     */
    window.addEventListener('load', function() {
        // パフォーマンス測定（開発用）
        if (window.performance && window.performance.timing) {
            const loadTime = window.performance.timing.loadEventEnd - 
                           window.performance.timing.navigationStart;
            console.log('Page load time:', loadTime + 'ms');
        }
        
        // 初期フォーカス設定
        const skipLink = document.querySelector('.skip-link');
        if (skipLink) {
            skipLink.addEventListener('click', function(e) {
                e.preventDefault();
                document.querySelector('main').focus();
            });
        }
    });
    
    // ========== エラーハンドリング ==========
    
    /**
     * JavaScript エラーの捕捉（本番環境では適切なログ送信を実装）
     */
    window.addEventListener('error', function(e) {
        console.error('JavaScript Error:', e.error);
        // 本番環境では適切なエラーレポートサービスに送信
    });
    
    /**
     * 未処理のPromise拒否の捕捉
     */
    window.addEventListener('unhandledrejection', function(e) {
        console.error('Unhandled Promise Rejection:', e.reason);
        // 本番環境では適切なエラーレポートサービスに送信
    });
    
})();