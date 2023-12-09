// chatbot/static/chatbot/js/script.js
console.log('Script.js is loaded');

document.addEventListener('DOMContentLoaded', function () {
    const messageInput = document.getElementById('message-input');
    const sendButton = document.getElementById('send-button');
    const placeOrderButton = document.querySelector('.place-order-button');
    const messageContainer = document.getElementById('message-container');
    const addToCartButtons = document.querySelectorAll('.add-to-cart');
    const removeFromCartButtons = document.querySelectorAll('.remove-from-cart');
    const addButtons = document.querySelectorAll('.add-button');
    const chatbot="Chatbot: "
    let isSeatConfirmed = false;
    let confirmedSeatNumber = '';
    let cart = {}; // Cart object to store items, quantities, and total price

    sendButton.addEventListener('click', function () {
        const content = messageInput.value.trim();

        if (isSeatConfirmed) {
            sendMessage(chatbot + 'Seat already confirmed. Select your item.');;
            isSeatConfirmed = false; // Reset the seat confirmation status
        } else {
            // Check if the user has entered a valid seat number
            if (isValidSeatNumber(content.toUpperCase())) {
                handleValidSeatInput(content);
            } else {
                handleInvalidSeatInput();
            }
        }

        messageInput.value = '';
    });

   // Event listener for "Place Order" button click
placeOrderButton.addEventListener('click', function () {
    if (Object.keys(cart).length === 0) {
        sendMessage('Cart is empty. Add items before placing an order.');
    } else {
        // Send cart items to the database (you can implement this part)
        sendCartToDatabase(cart);
        // Clear the cart after placing the order
        cart = {};
        // Update the UI to reflect the empty cart
        updateCartUI();
        // Inform the user that the order has been placed
        sendMessage('Order placed successfully. Thank you!');
    }
});


    // Event listener for "Add to Cart" button click
    addToCartButtons.forEach(button => {
        button.addEventListener('click', function (event) {
            event.preventDefault();
            const itemId = button.getAttribute('data-item-id');
            const itemName = button.getAttribute('data-item-name');
            const itemPrice = parseFloat(button.getAttribute('data-item-price'));
            addToCart(itemId, itemName, itemPrice);
        });
    });

    // Event listener for "Remove from Cart" button click
    removeFromCartButtons.forEach(button => {
        button.addEventListener('click', function (event) {
            event.preventDefault();
            const itemId = button.getAttribute('data-item-id');
            removeFromCart(itemId);
        });
    });

    // Event listener for "Add" button click
    addButtons.forEach(button => {
        button.addEventListener('click', function (event) {
            event.preventDefault();
            const itemId = button.getAttribute('data-item-id');
            addCartItem(itemId);
        });
    });

    function isValidSeatNumber(input) {
        const seatRegex = /^[a-zA-Z]\d{1,2}$/;
        return seatRegex.test(input);
    }

    function sendMessage(content) {
        if (content) {
            const messageDiv = document.createElement('div');
            messageDiv.classList.add('message');
            messageDiv.textContent = content;
            messageContainer.appendChild(messageDiv);
            messageContainer.scrollTop = messageContainer.scrollHeight;
        }
    }

    function handleValidSeatInput(content) {
        sendMessage('Seat confirmed. Select your item.');
        isSeatConfirmed = true;
        confirmedSeatNumber = content;
        // Additional logic for handling valid seat input
    }

    function handleInvalidSeatInput() {
        sendMessage('Invalid seat number. Please enter a valid seat number.');
        // Additional logic for handling invalid seat input
    }

    function addToCart(itemId, itemName, itemPrice) {
        if (isSeatConfirmed) {
            if (cart[itemId]) {
                cart[itemId].quantity += 1;
            } else {
                cart[itemId] = {
                    itemName: itemName,
                    quantity: 1,
                    itemPrice: itemPrice,
                };
            }

            const quantity = cart[itemId].quantity;
            const totalPrice = quantity * itemPrice;

            // Update the UI dynamically
            updateCartItemUI(itemId, itemName, quantity, totalPrice);
        } else {
            sendMessage(`${chatbot}Please select a seat number before adding to cart.`);
        }
    }

    function removeFromCart(itemId) {
        if (isSeatConfirmed) {
            if (cart[itemId]) {
                cart[itemId].quantity -= 1;

                if (cart[itemId].quantity > 0) {
                    const quantity = cart[itemId].quantity;
                    const totalPrice = quantity * cart[itemId].itemPrice;
                    updateCartItemUI(itemId, cart[itemId].itemName, quantity, totalPrice);
                } else {
                    removeCartItemUI(itemId);
                    delete cart[itemId];
                }
            }
        } else {
            sendMessage('Please select a seat number before removing from cart.');
        }
    }

    function addCartItem(itemId) {
        if (isSeatConfirmed) {
            if (cart[itemId]) {
                cart[itemId].quantity += 1;

                const quantity = cart[itemId].quantity;
                const totalPrice = quantity * cart[itemId].itemPrice;
                updateCartItemUI(itemId, cart[itemId].itemName, quantity, totalPrice);
            }
        } else {
            sendMessage('Please select a seat number before adding to cart.');
        }
    }

   // Update the sendCartToDatabase function to send cart data to the server
   function sendCartToDatabase(cart) {
    // Create an array to store order details
    const orders = [];

    // Convert the cart object into an array of order details
    for (const itemId in cart) {
        const orderDetail = {
            seat_number: confirmedSeatNumber,
            item_id: itemId,
            quantity: cart[itemId].quantity,
            total_price: cart[itemId].quantity * cart[itemId].itemPrice,
        };
        orders.push(orderDetail);
    }

    // Verify that the CSRF token is included in the headers of the fetch request
    const csrftoken = getCookie('csrftoken');
    fetch('/api/place-order/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': csrftoken,
        },
        body: JSON.stringify({ orders: orders }),
    })
        .then(response => response.json())
        .then(data => {
            console.log('Order placed successfully:', data);
            // Clear the cart after placing the order
            cart = {};
            // Update the UI to reflect the empty cart
            updateCartUI();
            // Inform the user that the order has been placed
            sendMessage('Order placed successfully. Thank you!');
        })
        .catch(error => {
            console.error('Error placing order:', error);
            sendMessage('Order success . Please wait 10 minuts.');
        });
}



function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
}


    function updateCartItemUI(itemId, itemName, quantity, totalPrice) {
        const cartItemElement = document.getElementById(`cart-item-${itemId}`);
        if (cartItemElement) {
            const quantityElement = cartItemElement.querySelector('.quantity');
            const totalPriceElement = cartItemElement.querySelector('.total-price');
            quantityElement.textContent = `Quantity: ${quantity}`;
            totalPriceElement.textContent = `Price: ₹${totalPrice}`;
        } else {
            const cartItemDiv = document.createElement('div');
            cartItemDiv.classList.add('cart-item');
            cartItemDiv.id = `cart-item-${itemId}`;
            cartItemDiv.innerHTML = `<p>${itemName} - <span class="quantity">Quantity: ${quantity}</span> - <span class="total-price">Price: ₹${totalPrice}</span>
                                    <a href="#" class="remove-from-cart" data-item-id="${itemId}">Remove</a>
                                    <a href="#" class="add-button" data-item-id="${itemId}">Add</a></p>`;
            messageContainer.appendChild(cartItemDiv);

            const removeButton = cartItemDiv.querySelector('.remove-from-cart');
            removeButton.addEventListener('click', function (event) {
                event.preventDefault();
                removeFromCart(itemId);
            });

            const addButton = cartItemDiv.querySelector('.add-button');
            addButton.addEventListener('click', function (event) {
                event.preventDefault();
                addCartItem(itemId);
            });
        }

        messageContainer.scrollTop = messageContainer.scrollHeight;
    }

    function removeCartItemUI(itemId) {
        const cartItemElement = document.getElementById(`cart-item-${itemId}`);
        if (cartItemElement) {
            cartItemElement.remove();
        }

        messageContainer.scrollTop = messageContainer.scrollHeight;
    }
});

// Define a variable to store the total cart amount
let totalCartAmount = 0;

// Function to update the UI for the cart
function updateCartUI() {

    updateTotalCartAmount();

    messageContainer.scrollTop = messageContainer.scrollHeight;
}

// Function to update the total cart amount
function updateTotalCartAmount() {
    totalCartAmount = calculateTotalCartAmount(); // Calculate the total cart amount
    displayTotalCartAmount(); // Display the total cart amount in the chat box
}

// Function to calculate the total cart amount
function calculateTotalCartAmount() {
    let totalAmount = 0;
    for (const itemId in cart) {
        totalAmount += cart[itemId].quantity * cart[itemId].itemPrice;
    }
    return totalAmount;
}

// Function to display the total cart amount in the chat box
function displayTotalCartAmount() {
    // Remove the previous total amount message (if exists)
    const totalAmountMessage = document.querySelector('#total-amount-message');
    if (totalAmountMessage) {
        totalAmountMessage.remove();
    }

    // Create a new div element for the total amount message
    const totalAmountDiv = document.createElement('div');
    totalAmountDiv.id = 'total-amount-message';
    totalAmountDiv.classList.add('message');
    totalAmountDiv.textContent = `Total Cart Amount: ₹${totalCartAmount}`;

    // Append the total amount message to the message container
    messageContainer.appendChild(totalAmountDiv);
}

// Call updateTotalCartAmount initially to display the total amount
updateTotalCartAmount();
