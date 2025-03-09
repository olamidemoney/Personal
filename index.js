// DOM Elements
const mobileMenuButton = document.getElementById('mobile-menu-button');
const mobileMenu = document.getElementById('mobile-menu');
const cartSidebar = document.getElementById('cart-sidebar');
const closeCartButton = document.getElementById('close-cart');
const cartItemsContainer = document.getElementById('cart-items');
const cartTotal = document.getElementById('cart-total');
const desktopCartCount = document.getElementById('desktop-cart-count');
const mobileCartCount = document.getElementById('mobile-cart-count');
const desktopCart = document.getElementById('desktop-cart');
const mobileCart = document.getElementById('mobile-cart');
const mobileMenuCart = document.getElementById('mobile-menu-cart');
const checkoutButton = document.getElementById('checkout-button');

// State
let cart = [];
let cartIsOpen = false;

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    // Load cart from localStorage if available
    loadCart();
    
    // Mobile menu toggle
    mobileMenuButton.addEventListener('click', toggleMobileMenu);
    
    // Cart toggle
    desktopCart.addEventListener('click', (e) => {
        e.preventDefault();
        toggleCartSidebar();
    });
    
    mobileCart.addEventListener('click', (e) => {
        e.preventDefault();
        toggleCartSidebar();
    });
    
    mobileMenuCart.addEventListener('click', (e) => {
        e.preventDefault();
        toggleCartSidebar();
        mobileMenu.classList.add('hidden');
    });
    
    closeCartButton.addEventListener('click', toggleCartSidebar);
    
    // Add event listeners to all "Add to Cart" buttons
    const addToCartButtons = document.querySelectorAll('button');
    addToCartButtons.forEach(button => {
        if (button.textContent === 'Add to Cart') {
            button.addEventListener('click', handleAddToCart);
        }
    });
    
    // Checkout button
    checkoutButton.addEventListener('click', handleCheckout);
});

// Functions
function toggleMobileMenu() {
    mobileMenu.classList.toggle('hidden');
}

function toggleCartSidebar() {
    cartIsOpen = !cartIsOpen;
    
    if (cartIsOpen) {
        cartSidebar.classList.remove('translate-x-full');
    } else {
        cartSidebar.classList.add('translate-x-full');
    }
}

function handleAddToCart(event) {
    const productCard = event.target.closest('div.bg-white');
    
    if (!productCard) return;
    
    const productName = productCard.querySelector('h3').textContent;
    const productPrice = productCard.querySelector('span').textContent;
    const productImage = productCard.querySelector('img').src;
    
    // Parse price to number
    const price = parseFloat(productPrice.replace('$', ''));
    
    // Check if product already in cart
    const existingProduct = cart.find(item => item.name === productName);
    
    if (existingProduct) {
        existingProduct.quantity += 1;
    } else {
        cart.push({
            id: Date.now().toString(),
            name: productName,
            price: price,
            image: productImage,
            quantity: 1
        });
    }
    
    // Save to localStorage
    saveCart();
    
    // Update UI
    updateCartUI();
    
    // Show cart sidebar
    if (!cartIsOpen) {
        toggleCartSidebar();
    }
}

function updateCartUI() {
    // Update cart count badges
    const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
    desktopCartCount.textContent = totalItems;
    mobileCartCount.textContent = totalItems;
    
    // Update cart items
    cartItemsContainer.innerHTML = '';
    
    if (cart.length === 0) {
        cartItemsContainer.innerHTML = '<div class="text-center text-gray-500 py-8">Your cart is empty</div>';
    } else {
        cart.forEach(item => {
            const cartItemElement = document.createElement('div');
            cartItemElement.className = 'flex items-start gap-3 py-4 border-b';
            cartItemElement.innerHTML = `
                <img src="${item.image}" alt="${item.name}" class="w-16 h-16 object-cover rounded">
                <div class="flex-grow">
                    <h4 class="font-semibold">${item.name}</h4>
                    <div class="flex justify-between items-center mt-2">
                        <div class="flex items-center border rounded">
                            <button class="px-2 py-1 decrease-quantity" data-id="${item.id}">-</button>
                            <span class="px-3">${item.quantity}</span>
                            <button class="px-2 py-1 increase-quantity" data-id="${item.id}">+</button>
                        </div>
                        <span>$${(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                </div>
                <button class="text-gray-500 hover:text-red-500 remove-item" data-id="${item.id}">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                </button>
            `;
            
            cartItemsContainer.appendChild(cartItemElement);
        });
        
        // Add event listeners to quantity buttons and remove buttons
        document.querySelectorAll('.decrease-quantity').forEach(button => {
            button.addEventListener('click', () => decreaseQuantity(button.dataset.id));
        });
        
        document.querySelectorAll('.increase-quantity').forEach(button => {
            button.addEventListener('click', () => increaseQuantity(button.dataset.id));
        });
        
        document.querySelectorAll('.remove-item').forEach(button => {
            button.addEventListener('click', () => removeFromCart(button.dataset.id));
        });
    }
    
    // Update total
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    cartTotal.textContent = `$${total.toFixed(2)}`;
}

function decreaseQuantity(itemId) {
    const item = cart.find(item => item.id === itemId);
    
    if (item) {
        if (item.quantity > 1) {
            item.quantity -= 1;
        } else {
            removeFromCart(itemId);
            return;
        }
        
        saveCart();
        updateCartUI();
    }
}

function increaseQuantity(itemId) {
    const item = cart.find(item => item.id === itemId);
    
    if (item) {
        item.quantity += 1;
        saveCart();
        updateCartUI();
    }
}

function removeFromCart(itemId) {
    cart = cart.filter(item => item.id !== itemId);
    saveCart();
    updateCartUI();
}

function saveCart() {
    localStorage.setItem('cart', JSON.stringify(cart));
}

function loadCart() {
    const savedCart = localStorage.getItem('cart');
    
    if (savedCart) {
        try {
            cart = JSON.parse(savedCart);
            updateCartUI();
        } catch (error) {
            console.error('Error loading cart from localStorage:', error);
            cart = [];
        }
    }
}

function handleCheckout() {
    if (cart.length === 0) {
        alert('Your cart is empty!');
        return;
    }
    
    alert('Thank you for your order! This is where the checkout process would begin.');
    
    // In a real application, you would redirect to a checkout page or open a modal
    // For this demo, we'll just clear the cart
    cart = [];
    saveCart();
    updateCartUI();
    toggleCartSidebar();
}

// Optional: Close cart when clicking outside
document.addEventListener('click', (e) => {
    if (cartIsOpen && 
        !cartSidebar.contains(e.target) && 
        !desktopCart.contains(e.target) && 
        !mobileCart.contains(e.target) && 
        !mobileMenuCart.contains(e.target)) {
        toggleCartSidebar();
    }
});