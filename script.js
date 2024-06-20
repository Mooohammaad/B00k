document.addEventListener('DOMContentLoaded', function() {
    const dateInput = document.getElementById('date');
    const today = new Date().toISOString().split('T')[0];
    dateInput.setAttribute('min', today);

    // Retrieve bookings from localStorage if available
    const storedBookings = localStorage.getItem('bookings');
    if (storedBookings) {
        bookings = JSON.parse(storedBookings);
    }

    // Generate seat map
    const seatsContainer = document.querySelector('.seats');
    for (let i = 1; i <= 14; i++) {
        const seat = document.createElement('div');
        seat.classList.add('seat');
        seat.textContent = i;
        seatsContainer.appendChild(seat);
    }

    // Update seat map when bus or date changes
    const busSelect = document.getElementById('bus');
    busSelect.addEventListener('change', updateSeatMap);
    dateInput.addEventListener('change', updateSeatMap);
});

let bookings = [];

document.getElementById('booking-form').addEventListener('submit', function(event) {
    event.preventDefault();

    const name = document.getElementById('name').value;
    const phone = document.getElementById('phone').value;
    const date = document.getElementById('date').value;
    const bus = document.getElementById('bus').value;
    const busTimes = {
        bus1: "9:00 AM",
        bus2: "12:00 PM",
        bus3: "3:00 PM",
        bus4: "6:00 PM"
    };

    // Validate name
    const nameParts = name.trim().split(/\s+/);
    if (name.length < 10 || nameParts.length < 3) {
        alert('يجب إدخال اسمك ثلاثي ');
        return;
    }

    // Validate phone number
    const phonePattern = /^(011|010|012|015)\d{8}$/;
    if (!phonePattern.test(phone)) {
        alert('رقم الهاتف هذا غير صحيح');
        return;
    }

    // Check for duplicate booking on the same date and with the same name or phone
    const duplicateBooking = bookings.find(booking => 
        (booking.name === name || booking.phone === phone) && booking.date === date
    );
    
    if (duplicateBooking) {
        alert('تم الحجز بنفس هذا الرقم او هذا الإسم مسبقا');
        return;
    }

    // Check seat availability
    const bookedSeats = bookings.filter(booking => booking.bus === bus && booking.date === date).length;
    if (bookedSeats >= 14) {
        alert('لا يوجد مقاعد متاحة في هذا الباص في هذا التوقيت والتاريخ');
        return;
    }
    
    // Add new booking to the array
    bookings.push({ name, phone, date, bus });

    // Store bookings in localStorage
    localStorage.setItem('bookings', JSON.stringify(bookings));

    // Update seat map
    updateSeatMap();

    const confirmationMessage = `شكرا لك
   تم الحجز بإسم , ${name}
    الساعه ${busTimes[bus]}
   بتاريخ ${date}
   ورقمك هو ${phone}`;
    
    document.getElementById('confirmation').innerText = confirmationMessage;
    
    // Show alert with booking details
    alert(`تفاصيل الحجز⬇️\nالإسم: ${name}\nوقت الباص: ${busTimes[bus]}\nالتاريخ: ${date}\nرقم الهاتف: ${phone}`);
    
    // Reset the form
    document.getElementById('booking-form').reset();
});

function updateSeatMap() {
    const bus = document.getElementById('bus').value;
    const date = document.getElementById('date').value;
    const seats = document.querySelectorAll('.seat');
    
    // Reset seat selection
    seats.forEach(seat => {
        seat.classList.remove('selected');
        seat.querySelector('button')?.remove();
    });
    
    // Mark booked seats
    const bookedSeats = bookings.filter(booking => booking.bus === bus && booking.date === date);
    bookedSeats.forEach((booking, index) => {
        const seat = seats[index];
        seat.classList.add('selected');
        
        // Add remove button to each booked seat
        const removeButton = document.createElement('button');
        removeButton.textContent = '';
        removeButton.addEventListener('click', (e) => {
            e.stopPropagation();
            const name = document.getElementById('name').value;
            const phone = document.getElementById('phone').value;
            if (booking.name === name && booking.phone === phone) {
                removeBooking(booking);
            } else {
                alert('أدخل بياناتك مرة أخرى (نفس الاسم والهاتف والتاريخ) لتأكيد إزالة حجزك');
            }
        });
        seat.appendChild(removeButton);
    });
}

function removeBooking(bookingToRemove) {
    bookings = bookings.filter(booking => 
        booking.name !== bookingToRemove.name || 
        booking.phone !== bookingToRemove.phone || 
        booking.date !== bookingToRemove.date || 
        booking.bus !== bookingToRemove.bus
    );
    
    // Update localStorage after removing booking
    localStorage.setItem('bookings', JSON.stringify(bookings));

    updateSeatMap();
    alert('تم حذف مقعدك بنجاح');
}