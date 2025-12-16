// Variables globales
let products = [];
let cart = JSON.parse(localStorage.getItem("cart")) || [];
const API_URL = "https://fakestoreapi.com/products";
const CART_MODAL = new bootstrap.Modal(document.getElementById("cartModal"));

// Elementos del DOM
const productsContainer = document.getElementById("productsContainer");
const cartIcon = document.getElementById("cartIcon");
const cartCount = document.getElementById("cartCount");
const cartContainer = document.getElementById("cartContainer");
const cartItems = document.getElementById("cartItems");
const emptyCart = document.getElementById("emptyCart");
const cartFooter = document.getElementById("cartFooter");
const cartTotal = document.getElementById("cartTotal");
const checkoutBtn = document.getElementById("checkoutBtn");
const filterBtns = document.querySelectorAll(".filter-btn");
const contactForm = document.getElementById("contactForm");
const successMessage = document.getElementById("successMessage");
const errorMessage = document.getElementById("errorMessage");

// Inicialización
document.addEventListener("DOMContentLoaded", () => {
  loadProducts();
  updateCartCount();
  setupEventListeners();
});

// Cargar productos desde la API
async function loadProducts() {
  try {
    const response = await fetch(API_URL);
    if (!response.ok) throw new Error("Error al cargar los productos");

    products = await response.json();
    // Añadimos categorías personalizadas a los productos
    products = products.map((product) => {
      const categories = ["ropa", "accesorios", "ofertas"];
      const randomCategory =
        categories[Math.floor(Math.random() * categories.length)];
      return {
        ...product,
        category: randomCategory,
      };
    });

    displayProducts(products);
  } catch (error) {
    console.error("Error:", error);
    productsContainer.innerHTML = `
            <div class="alert alert-danger w-100 text-center">
                <p>Error al cargar los productos. Por favor, intenta nuevamente más tarde.</p>
                <button class="btn btn-primary mt-2" onclick="loadProducts()">Reintentar</button>
            </div>
        `;
  }
}

// Mostrar productos en el DOM
function displayProducts(productsToShow) {
  if (productsToShow.length === 0) {
    productsContainer.innerHTML =
      '<p class="text-center w-100">No se encontraron productos.</p>';
    return;
  }

  productsContainer.innerHTML = "";

  productsToShow.forEach((product) => {
    const productCard = createProductCard(product);
    productsContainer.appendChild(productCard);
  });
}

// Crear tarjeta de producto
function createProductCard(product) {
  const card = document.createElement("div");
  card.className = "product-card";
  card.dataset.category = product.category;

  card.innerHTML = `
        <img src="${product.image}" alt="${product.title}" class="product-img">
        <div class="product-info">
            <h3 class="product-title">${
              product.title.length > 50
                ? product.title.substring(0, 50) + "..."
                : product.title
            }</h3>
            <div class="product-category">${product.category.toUpperCase()}</div>
            <p class="product-price">$${product.price.toFixed(2)}</p>
            <button class="btn btn-primary btn-add-to-cart" data-id="${
              product.id
            }">
                <i class="fas fa-cart-plus"></i> Añadir al Carrito
            </button>
        </div>
    `;

  // Añadir evento al botón de carrito
  const addToCartBtn = card.querySelector(".btn-add-to-cart");
  addToCartBtn.addEventListener("click", () => addToCart(product));

  return card;
}

// Filtrar productos por categoría
function setupFilterButtons() {
  filterBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      // Remover clase active de todos los botones
      filterBtns.forEach((b) => b.classList.remove("active"));
      // Añadir clase active al botón clickeado
      btn.classList.add("active");

      const filter = btn.dataset.filter;
      filterProducts(filter);
    });
  });
}

// Filtrar productos
function filterProducts(filter) {
  let filteredProducts = [];

  if (filter === "all") {
    filteredProducts = products;
  } else {
    filteredProducts = products.filter(
      (product) => product.category === filter
    );
  }

  displayProducts(filteredProducts);
}

// Funcionalidad del carrito
function addToCart(product) {
  const existingItemIndex = cart.findIndex((item) => item.id === product.id);

  if (existingItemIndex > -1) {
    // Si el producto ya está en el carrito, aumentar la cantidad
    cart[existingItemIndex].quantity += 1;
  } else {
    // Si no está, añadirlo con cantidad 1
    cart.push({
      ...product,
      quantity: 1,
    });
  }

  // Actualizar localStorage
  localStorage.setItem("cart", JSON.stringify(cart));

  // Actualizar interfaz
  updateCartCount();
  showNotification("Producto añadido al carrito", "success");

  // Si el carrito está abierto, actualizarlo
  if (document.querySelector(".modal.show")) {
    displayCartItems();
  }
}

// Actualizar contador del carrito
function updateCartCount() {
  const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
  cartCount.textContent = totalItems;
}

// Mostrar notificación
function showNotification(message, type = "info") {
  // Crear elemento de notificación
  const notification = document.createElement("div");
  notification.className = `alert alert-${type} notification`;
  notification.textContent = message;
  notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 9999;
        min-width: 300px;
        animation: slideIn 0.3s ease;
    `;

  document.body.appendChild(notification);

  // Eliminar notificación después de 3 segundos
  setTimeout(() => {
    notification.style.animation = "slideOut 0.3s ease";
    setTimeout(() => notification.remove(), 300);
  }, 3000);
}

// Mostrar elementos del carrito
function displayCartItems() {
  if (cart.length === 0) {
    emptyCart.classList.remove("d-none");
    cartItems.classList.add("d-none");
    cartFooter.classList.add("d-none");
    return;
  }

  emptyCart.classList.add("d-none");
  cartItems.classList.remove("d-none");
  cartFooter.classList.remove("d-none");

  cartItems.innerHTML = "";

  let totalPrice = 0;

  cart.forEach((item) => {
    const cartItem = createCartItemElement(item);
    cartItems.appendChild(cartItem);

    totalPrice += item.price * item.quantity;
  });

  cartTotal.textContent = `$${totalPrice.toFixed(2)}`;
}

// Crear elemento de carrito
function createCartItemElement(item) {
  const itemElement = document.createElement("div");
  itemElement.className = "cart-item";

  itemElement.innerHTML = `
        <img src="${item.image}" alt="${item.title}" class="cart-item-img">
        <div class="cart-item-info">
            <h4 class="cart-item-title">${
              item.title.length > 40
                ? item.title.substring(0, 40) + "..."
                : item.title
            }</h4>
            <p class="cart-item-price">$${item.price.toFixed(2)} c/u</p>
        </div>
        <div class="cart-item-controls">
            <div class="quantity-control">
                <button class="quantity-btn minus" data-id="${
                  item.id
                }">-</button>
                <input type="text" class="quantity-input" value="${
                  item.quantity
                }" data-id="${item.id}" readonly>
                <button class="quantity-btn plus" data-id="${
                  item.id
                }">+</button>
            </div>
            <button class="btn-remove" data-id="${item.id}">
                <i class="fas fa-trash"></i>
            </button>
        </div>
    `;

  return itemElement;
}

// Actualizar cantidad de producto en el carrito
function updateCartItemQuantity(productId, change) {
  const itemIndex = cart.findIndex((item) => item.id === productId);

  if (itemIndex === -1) return;

  cart[itemIndex].quantity += change;

  // Si la cantidad es 0 o menor, eliminar el producto
  if (cart[itemIndex].quantity <= 0) {
    cart.splice(itemIndex, 1);
  }

  // Actualizar localStorage
  localStorage.setItem("cart", JSON.stringify(cart));

  // Actualizar interfaz
  updateCartCount();
  displayCartItems();
}

// Eliminar producto del carrito
function removeCartItem(productId) {
  cart = cart.filter((item) => item.id !== productId);

  // Actualizar localStorage
  localStorage.setItem("cart", JSON.stringify(cart));

  // Actualizar interfaz
  updateCartCount();
  displayCartItems();

  showNotification("Producto eliminado del carrito", "warning");
}

// Configurar eventos
function setupEventListeners() {
  // Abrir carrito
  cartIcon.addEventListener("click", () => {
    displayCartItems();
    CART_MODAL.show();
  });

  // Filtrar productos
  setupFilterButtons();

  // Eventos delegados para el carrito
  document.addEventListener("click", (e) => {
    // Botones de cantidad
    if (e.target.classList.contains("quantity-btn")) {
      const productId = parseInt(e.target.dataset.id);
      const isPlus = e.target.classList.contains("plus");
      updateCartItemQuantity(productId, isPlus ? 1 : -1);
    }

    // Botón eliminar
    if (e.target.closest(".btn-remove")) {
      const productId = parseInt(e.target.closest(".btn-remove").dataset.id);
      removeCartItem(productId);
    }
  });

  // Finalizar compra
  checkoutBtn.addEventListener("click", () => {
    if (cart.length === 0) return;

    // Simular proceso de pago
    showNotification("¡Compra realizada con éxito!", "success");

    // Vaciar carrito
    cart = [];
    localStorage.setItem("cart", JSON.stringify(cart));

    // Actualizar interfaz
    updateCartCount();
    displayCartItems();

    // Cerrar modal después de 1.5 segundos
    setTimeout(() => {
      CART_MODAL.hide();
    }, 1500);
  });

  // Validación de formulario de contacto
  if (contactForm) {
    contactForm.addEventListener("submit", handleContactFormSubmit);

    // Validación en tiempo real
    const nameInput = document.getElementById("name");
    const emailInput = document.getElementById("email");
    const messageInput = document.getElementById("message");

    nameInput.addEventListener("blur", validateName);
    emailInput.addEventListener("blur", validateEmail);
    messageInput.addEventListener("blur", validateMessage);
  }

  // Suavizar desplazamiento para enlaces internos
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", function (e) {
      e.preventDefault();

      const targetId = this.getAttribute("href");
      if (targetId === "#") return;

      const targetElement = document.querySelector(targetId);
      if (targetElement) {
        window.scrollTo({
          top: targetElement.offsetTop - 80,
          behavior: "smooth",
        });
      }
    });
  });
}

// Validación de formulario de contacto
function validateName() {
  const nameInput = document.getElementById("name");
  const nameError = document.getElementById("nameError");

  if (nameInput.value.trim() === "") {
    nameInput.classList.add("is-invalid");
    nameError.textContent = "Por favor ingresa tu nombre completo.";
    return false;
  } else if (nameInput.value.trim().length < 3) {
    nameInput.classList.add("is-invalid");
    nameError.textContent = "El nombre debe tener al menos 3 caracteres.";
    return false;
  } else {
    nameInput.classList.remove("is-invalid");
    return true;
  }
}

function validateEmail() {
  const emailInput = document.getElementById("email");
  const emailError = document.getElementById("emailError");
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (emailInput.value.trim() === "") {
    emailInput.classList.add("is-invalid");
    emailError.textContent = "Por favor ingresa tu correo electrónico.";
    return false;
  } else if (!emailRegex.test(emailInput.value)) {
    emailInput.classList.add("is-invalid");
    emailError.textContent = "Por favor ingresa un correo electrónico válido.";
    return false;
  } else {
    emailInput.classList.remove("is-invalid");
    return true;
  }
}

function validateMessage() {
  const messageInput = document.getElementById("message");
  const messageError = document.getElementById("messageError");

  if (messageInput.value.trim() === "") {
    messageInput.classList.add("is-invalid");
    messageError.textContent = "Por favor ingresa tu mensaje.";
    return false;
  } else if (messageInput.value.trim().length < 10) {
    messageInput.classList.add("is-invalid");
    messageError.textContent = "El mensaje debe tener al menos 10 caracteres.";
    return false;
  } else {
    messageInput.classList.remove("is-invalid");
    return true;
  }
}

// Manejar envío de formulario de contacto
function handleContactFormSubmit(e) {
  e.preventDefault();

  // Validar todos los campos
  const isNameValid = validateName();
  const isEmailValid = validateEmail();
  const isMessageValid = validateMessage();

  if (!isNameValid || !isEmailValid || !isMessageValid) {
    showNotification(
      "Por favor, corrige los errores en el formulario.",
      "warning"
    );
    return;
  }

  // Mostrar indicador de carga
  const submitBtn = contactForm.querySelector(".btn-submit");
  const originalText = submitBtn.textContent;
  submitBtn.textContent = "Enviando...";
  submitBtn.disabled = true;

  // Simular envío (en un caso real, aquí se enviaría a Formspree)
  setTimeout(() => {
    // Restaurar botón
    submitBtn.textContent = originalText;
    submitBtn.disabled = false;

    // Mostrar mensaje de éxito
    successMessage.classList.remove("d-none");
    errorMessage.classList.add("d-none");

    // Limpiar formulario
    contactForm.reset();

    // Ocultar mensaje después de 5 segundos
    setTimeout(() => {
      successMessage.classList.add("d-none");
    }, 5000);

    showNotification("Mensaje enviado correctamente", "success");
  }, 1500);
}

// Añadir animación CSS para notificaciones
const style = document.createElement("style");
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
`;
document.head.appendChild(style);
