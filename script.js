document.addEventListener('DOMContentLoaded', () => {
    // Hamburger menu
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('nav ul');
    const userAvatar = document.getElementById('user-avatar');
    const userBalance = document.getElementById('user-balance');
    const logoutBtn = document.getElementById('logout-btn');

    if (hamburger && navMenu) {
        hamburger.addEventListener('click', () => {
            navMenu.classList.toggle('active');
        });
    }

    // Update UI based on login status
    function updateUI() {
        const user = JSON.parse(localStorage.getItem('currentUser'));
        if (user) {
            if (userAvatar) userAvatar.src = 'https://via.placeholder.com/40?text=User';
            if (userBalance) userBalance.textContent = `${user.balance.toLocaleString()} VNĐ`;
            if (logoutBtn) logoutBtn.style.display = 'block';
            const qrUsername = document.getElementById('qr-username');
            if (qrUsername) qrUsername.textContent = user.username;
        } else {
            if (userAvatar) userAvatar.src = 'https://via.placeholder.com/40?text=User';
            if (userBalance) userBalance.textContent = '0 VNĐ';
            if (logoutBtn) logoutBtn.style.display = 'none';
        }
    }

    // Logout
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            localStorage.removeItem('currentUser');
            localStorage.removeItem('adminLoggedIn');
            updateUI();
            alert('Đăng xuất thành công!');
            window.location.href = 'index.html';
        });
    }

    // User login
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;
            const users = JSON.parse(localStorage.getItem('users')) || [];
            const user = users.find(u => u.username === username && u.password === password);
            if (user) {
                localStorage.setItem('currentUser', JSON.stringify(user));
                updateUI();
                alert('Đăng nhập thành công!');
                window.location.href = 'index.html';
            } else {
                alert('Tên đăng nhập hoặc mật khẩu không đúng!');
            }
        });
    }

    // User register
    const registerForm = document.getElementById('register-form');
    if (registerForm) {
        registerForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const username = document.getElementById('username').value;
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const users = JSON.parse(localStorage.getItem('users')) || [];
            if (users.find(u => u.username === username)) {
                alert('Tên đăng nhập đã tồn tại!');
                return;
            }
            const newUser = {
                id: users.length ? Math.max(...users.map(u => u.id)) + 1 : 1,
                username,
                email,
                password,
                balance: 0
            };
            users.push(newUser);
            localStorage.setItem('users', JSON.stringify(users));
            localStorage.setItem('currentUser', JSON.stringify(newUser));
            updateUI();
            alert('Đăng ký thành công!');
            window.location.href = 'index.html';
        });
    }

    // Admin login
    const adminLoginForm = document.getElementById('admin-login-form');
    if (adminLoginForm) {
        adminLoginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;
            if (username === 'admin' && password === 'admin123') {
                localStorage.setItem('adminLoggedIn', 'true');
                window.location.href = 'admin.html';
            } else {
                alert('Tên đăng nhập hoặc mật khẩu không đúng!');
            }
        });
    }

    // Restrict admin access
    if (window.location.pathname.includes('admin.html')) {
        const adminLoggedIn = localStorage.getItem('adminLoggedIn') === 'true';
        if (!adminLoggedIn) {
            alert('Vui lòng đăng nhập admin!');
            window.location.href = 'admin-login.html';
        }
    }

    // Restrict deposit access
    if (window.location.pathname.includes('deposit.html')) {
        const user = JSON.parse(localStorage.getItem('currentUser'));
        if (!user) {
            alert('Vui lòng đăng nhập để nạp tiền!');
            window.location.href = 'login.html';
        }
    }

    // Deposit money (direct buttons)
    const depositButtons = document.querySelectorAll('.deposit-btn');
    if (depositButtons) {
        depositButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const amount = parseInt(e.target.dataset.amount);
                const user = JSON.parse(localStorage.getItem('currentUser'));
                if (user) {
                    user.balance += amount;
                    const users = JSON.parse(localStorage.getItem('users')) || [];
                    const userToUpdate = users.find(u => u.id === user.id);
                    if (userToUpdate) {
                        userToUpdate.balance = user.balance;
                        localStorage.setItem('users', JSON.stringify(users));
                    }
                    localStorage.setItem('currentUser', JSON.stringify(user));
                    updateUI();
                    alert(`Nạp ${amount.toLocaleString()} VNĐ thành công!`);
                }
            });
        });
    }

    // Card deposit (mô phỏng API doithe.com.vn)
    const submitCardBtn = document.getElementById('submit-card-btn');
    if (submitCardBtn) {
        submitCardBtn.addEventListener('click', () => {
            const user = JSON.parse(localStorage.getItem('currentUser'));
            const provider = document.getElementById('card-provider').value;
            const amount = parseInt(document.getElementById('card-amount').value);
            const cardCode = document.getElementById('card-code').value;
            const cardSerial = document.getElementById('card-serial').value;

            if (!provider || !amount || !cardCode || !cardSerial) {
                alert('Vui lòng điền đầy đủ thông tin thẻ cào!');
                return;
            }

            // Mô phỏng gọi API doithe.com.vn
            if (user && amount) {
                // Giả lập phản hồi thành công từ API
                user.balance += amount;
                const users = JSON.parse(localStorage.getItem('users')) || [];
                const userToUpdate = users.find(u => u.id === user.id);
                if (userToUpdate) {
                    userToUpdate.balance = user.balance;
                    localStorage.setItem('users', JSON.stringify(users));
                }
                localStorage.setItem('currentUser', JSON.stringify(user));
                updateUI();
                document.getElementById('card-provider').value = '';
                document.getElementById('card-amount').value = '';
                document.getElementById('card-code').value = '';
                document.getElementById('card-serial').value = '';
                alert(`Nạp ${amount.toLocaleString()} VNĐ bằng thẻ ${provider} thành công!`);
            }
        });
    }

    // VietQR deposit
    const generateQrBtn = document.getElementById('generate-qr-btn');
    const confirmQrBtn = document.getElementById('confirm-qr-btn');
    const qrCodeImg = document.getElementById('qrcode');
    const qrAmountSpan = document.getElementById('qr-amount');
    let selectedAmount = 0;

    if (generateQrBtn) {
        generateQrBtn.addEventListener('click', () => {
            const user = JSON.parse(localStorage.getItem('currentUser'));
            selectedAmount = parseInt(document.getElementById('vietqr-amount').value);
            if (user && selectedAmount) {
                qrAmountSpan.textContent = `${selectedAmount.toLocaleString()} VNĐ`;
                qrCodeImg.style.display = 'block';
                confirmQrBtn.style.display = 'block';
            } else {
                alert('Vui lòng chọn số tiền!');
            }
        });
    }

    if (confirmQrBtn) {
        confirmQrBtn.addEventListener('click', () => {
            const user = JSON.parse(localStorage.getItem('currentUser'));
            if (user && selectedAmount) {
                user.balance += selectedAmount;
                const users = JSON.parse(localStorage.getItem('users')) || [];
                const userToUpdate = users.find(u => u.id === user.id);
                if (userToUpdate) {
                    userToUpdate.balance = user.balance;
                    localStorage.setItem('users', JSON.stringify(users));
                }
                localStorage.setItem('currentUser', JSON.stringify(user));
                updateUI();
                qrCodeImg.style.display = 'none';
                confirmQrBtn.style.display = 'none';
                alert(`Nạp ${selectedAmount.toLocaleString()} VNĐ bằng VietQR thành công!`);
            }
        });
    }

    // Admin: Add account form
    const addAccountForm = document.getElementById('add-account-form');
    const accountList = document.getElementById('account-list');
    const imageInput = document.getElementById('image');
    const imagePreview = document.getElementById('image-preview');
    const userList = document.getElementById('user-list');

    // Load existing accounts
    let accounts = JSON.parse(localStorage.getItem('accounts')) || [
        {
            id: 1,
            name: 'Tài Khoản Liên Minh Huyền Thoại',
            description: 'Rank: Kim Cương, 50 Skin, Full Tướng',
            price: 500000,
            image: 'https://via.placeholder.com/300x150'
        },
        {
            id: 2,
            name: 'Tài Khoản PUBG Mobile',
            description: 'Rank: Ace, Full Set Huyền Thoại',
            price: 800000,
            image: 'https://via.placeholder.com/300x150'
        },
        {
            id: 3,
            name: 'Tài Khoản Genshin Impact',
            description: 'AR 55, 5* Characters, Full Vũ Khí',
            price: 1200000,
            image: 'https://via.placeholder.com/300x150'
        }
    ];

    // Update account list
    function updateAccountList() {
        if (accountList) {
            accountList.innerHTML = '';
            accounts.forEach(account => {
                const card = document.createElement('div');
                card.className = 'product-card';
                card.dataset.id = account.id;
                card.innerHTML = `
                    <img src="${account.image}" alt="Game Account">
                    <div class="product-info">
                        <h3>${account.name}</h3>
                        <p>${account.description}</p>
                        <div class="price">${account.price.toLocaleString()} VNĐ</div>
                        <button class="edit-btn">Chỉnh Sửa</button>
                    </div>
                `;
                accountList.appendChild(card);
            });

            document.querySelectorAll('.edit-btn').forEach(button => {
                button.addEventListener('click', (e) => {
                    const card = e.target.closest('.product-card');
                    const id = parseInt(card.dataset.id);
                    const account = accounts.find(acc => acc.id === id);
                    document.getElementById('game-name').value = account.name;
                    document.getElementById('description').value = account.description;
                    document.getElementById('price').value = account.price;
                    imagePreview.src = account.image;
                    imagePreview.style.display = 'block';
                    addAccountForm.dataset.editId = id;
                });
            });
        }

        const productList = document.getElementById('product-list');
        if (productList) {
            productList.innerHTML = '';
            accounts.forEach(account => {
                const card = document.createElement('div');
                card.className = 'product-card';
                card.dataset.id = account.id;
                card.innerHTML = `
                    <img src="${account.image}" alt="Game Account">
                    <div class="product-info">
                        <h3>${account.name}</h3>
                        <p>${account.description}</p>
                        <div class="price">${account.price.toLocaleString()} VNĐ</div>
                        <a href="#" class="buy-btn">Mua Ngay</a>
                    </div>
                `;
                productList.appendChild(card);
            });
        }

        localStorage.setItem('accounts', JSON.stringify(accounts));
    }

    // Image preview
    if (imageInput) {
        imageInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = () => {
                    imagePreview.src = reader.result;
                    imagePreview.style.display = 'block';
                };
                reader.readAsDataURL(file);
            }
        });
    }

    // Add or edit account
    if (addAccountForm) {
        addAccountForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const name = document.getElementById('game-name').value;
            const description = document.getElementById('description').value;
            const price = parseInt(document.getElementById('price').value);
            const image = imagePreview.src || 'https://via.placeholder.com/300x150';
            const editId = addAccountForm.dataset.editId;

            if (editId) {
                const id = parseInt(editId);
                const account = accounts.find(acc => acc.id === id);
                account.name = name;
                account.description = description;
                account.price = price;
                account.image = image;
                delete addAccountForm.dataset.editId;
            } else {
                const newAccount = {
                    id: accounts.length ? Math.max(...accounts.map(acc => acc.id)) + 1 : 1,
                    name,
                    description,
                    price,
                    image
                };
                accounts.push(newAccount);
            }

            updateAccountList();
            addAccountForm.reset();
            imagePreview.style.display = 'none';
            alert(editId ? 'Chỉnh sửa tài khoản thành công!' : 'Thêm tài khoản thành công!');
        });
    }

    // Update user list
    function updateUserList() {
        if (userList) {
            userList.innerHTML = '';
            const users = JSON.parse(localStorage.getItem('users')) || [];
            users.forEach(user => {
                const card = document.createElement('div');
                card.className = 'product-card';
                card.dataset.id = user.id;
                card.innerHTML = `
                    <img src="https://via.placeholder.com/40?text=User" alt="User Avatar">
                    <div class="product-info">
                        <h3>${user.username}</h3>
                        <p>Email: ${user.email}</p>
                        <div class="price">${user.balance.toLocaleString()} VNĐ</div>
                        <button class="edit-btn">Chỉnh Sửa Số Tiền</button>
                    </div>
                `;
                userList.appendChild(card);
            });

            document.querySelectorAll('.edit-btn').forEach(button => {
                button.addEventListener('click', (e) => {
                    const card = e.target.closest('.product-card');
                    const id = parseInt(card.dataset.id);
                    const newBalance = prompt('Nhập số tiền mới (VNĐ):', '0');
                    if (newBalance !== null && !isNaN(newBalance)) {
                        const users = JSON.parse(localStorage.getItem('users')) || [];
                        const user = users.find(u => u.id === id);
                        user.balance = parseInt(newBalance);
                        localStorage.setItem('users', JSON.stringify(users));
                        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
                        if (currentUser && currentUser.id === id) {
                            currentUser.balance = parseInt(newBalance);
                            localStorage.setItem('currentUser', JSON.stringify(currentUser));
                        }
                        updateUserList();
                        updateUI();
                        alert('Cập nhật số tiền thành công!');
                    }
                });
            });
        }
    }

    updateAccountList();
    updateUserList();
    updateUI();
});
