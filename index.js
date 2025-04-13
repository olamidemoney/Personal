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
    
    // Create a modal overlay
    const overlay = document.createElement('div');
    overlay.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
    
    // Create the checkout form
    const formContainer = document.createElement('div');
    formContainer.className = 'bg-white p-6 rounded-lg shadow-xl max-w-md w-full';
    
    formContainer.innerHTML = `
        <h2 class="text-xl font-bold mb-4">Complete Your Order</h2>
        <form id="checkout-form" class="space-y-4">
            <div>
                <label class="block text-sm font-medium text-gray-700">Full Name</label>
                <input type="text" id="customer-name" required class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500">
            </div>
            <div>
                <label class="block text-sm font-medium text-gray-700">WhatsApp Number</label>
                <input type="tel" id="customer-whatsapp" required class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500">
            </div>
            <div>
                <label class="block text-sm font-medium text-gray-700">Email Address</label>
                <input type="email" id="customer-email" required class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500">
            </div>
            <div class="flex space-x-3 pt-2">
                <button type="submit" class="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                    Complete Order
                </button>
                <button type="button" id="cancel-checkout" class="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                    Cancel
                </button>
            </div>
        </form>
    `;
    
    overlay.appendChild(formContainer);
    document.body.appendChild(overlay);
    
    // Cancel button functionality
    document.getElementById('cancel-checkout').addEventListener('click', function() {
        document.body.removeChild(overlay);
    });
    
    // Form submission handler
    document.getElementById('checkout-form').addEventListener('submit', function(e) {
        e.preventDefault();
        
        const customerName = document.getElementById('customer-name').value;
        const customerWhatsapp = document.getElementById('customer-whatsapp').value;
        const customerEmail = document.getElementById('customer-email').value;
        
        // Prepare cart items for the message
        let cartItems = '';
        let totalAmount = 0;
        
        cart.forEach((item, index) => {
            cartItems += `${index + 1}. ${item.name} - ${item.quantity} x $${item.price} = $${(item.quantity * item.price).toFixed(2)}\n`;
            totalAmount += item.quantity * item.price;
        });
        
        // Format the WhatsApp message
        const message = encodeURIComponent(
            `*New Order*\n\n` +
            `*Customer Details:*\n` +
            `Name: ${customerName}\n` +
            `WhatsApp: ${customerWhatsapp}\n` +
            `Email: ${customerEmail}\n\n` +
            `*Order Details:*\n${cartItems}\n` +
            `*Total: $${totalAmount.toFixed(2)}*`
        );
        
        // The phone number should be the business number without any symbols
        const phoneNumber = '2348102974538'; // Replace with your WhatsApp business number
        
        // Create WhatsApp URL and open it
        window.open(`https://wa.me/${phoneNumber}?text=${message}`, '_blank');
        
        // Clean up
        document.body.removeChild(overlay);
        cart = [];
        saveCart();
        updateCartUI();
        toggleCartSidebar();
        
        alert('Thank you for your order! You will be redirected to WhatsApp to complete your purchase.');
    });
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