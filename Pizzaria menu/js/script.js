//Select the form
const pizzaForm = document.querySelector('.pizza-form');
//Select form inputs
const pizzaName = document.getElementById('pizza-name');
const pizzaPrice = document.getElementById('pizza-price');
const pizzaHeat = document.getElementById('pizza-heat');
const pizzaToppings = document.getElementById('pizza-toppings');
const pizzaPhotos = document.getElementsByName('photo');
//Select container with output
const pizzaMenu = document.querySelector('.pizza-menu');
//Get selected filter
let filter = document.querySelector('input[name="filter"]:checked').value;
//get filter labels
const nameLabel = document.getElementById('name-label');
const priceLabel = document.getElementById('price-label');
const heatLabel = document.getElementById('heat-label');
//Array which stores all generated pizzas
let pizzas = [];

//Functions for form validation
function checkUniqueName(name) {
    if(pizzas.length > 0) {
        const reference = sessionStorage.getItem('pizzas');
        pizzas = JSON.parse(reference);
        for(let pizza of pizzas) {
            if(pizza.name === name){
                return false;
            }
        }
        return true;
    }
    return true;
}

function toppingsToArray(toppings) {
    let toppingArray = [];
    if(toppings.includes(',')) {
        for(let topping of toppings.split(',')) {
            toppingArray.push(topping.trim());
        }
    }
    else if(toppings.includes(' ')) {
        for(let topping of toppings.split(' ')) {
            toppingArray.push(topping);
        }
    }
    toppingArray = toppingArray.filter(topping => {
        return topping !== '';
    })
    return toppingArray;
}

//On submit call addPizza function
pizzaForm.addEventListener('submit', function(event) {
    event.preventDefault();
    //Adjusting optional choices
    //if heat value is not selected it has to be set to 0 to successfully execute renderPizzas
    if(pizzaHeat.value == "") {
        pizzaHeat.value = "0";
    }
    //if photo is not selected it has to be set to an empty string also to successfully execute renderPizzas
    let pizzaPhoto;
    if(!document.querySelector('input[name="photo"]:checked')) {
        pizzaPhoto = "";
    } else {
        pizzaPhoto = document.querySelector('input[name="photo"]:checked').value;
    }

    //call ToppingsToArrays to evaluate number of strings within it
    let pizzaTop = toppingsToArray(pizzaToppings.value)

    //if all user inputs ar set correctly addPizza is called
    if(checkUniqueName(pizzaName.value) && pizzaTop.length >= 2) {
        addPizza(pizzaName.value,pizzaPrice.value,pizzaHeat.value,pizzaTop,pizzaPhoto);
    }
    else if(pizzaTop.length < 2) {
        alert('Please add at least 2 toppings');
    }
    else {
        alert('Name already exists');
    }
})

//addPizza generates pizza object with user input values and calls addToSessionStorage
function addPizza(nameValue,priceValue,heatValue,toppingsValue,photoValue) {
    if(nameValue !='' && priceValue !='' && heatValue !='' && toppingsValue.length >= 2) {
        const pizza = {
            id: Date.now(),
            name: nameValue,
            price: priceValue,
            heat: heatValue,
            toppings: toppingsValue,
            photo: photoValue
        };
        pizzas.push(pizza);
        addToSessionStorage(pizzas)
        //clear input boxes and radio selection
        pizzaName.value = '';
        pizzaPrice.value = '';
        pizzaHeat.value = '';
        pizzaToppings.value = '';
        for(let i = 0; i < pizzaPhotos.length; i++) {
            pizzaPhotos[i].checked = false;
        };
    }
}

//used to render object into the browser
function renderPizzas(pizzas) {
    pizzaMenu.innerHTML = '';

    pizzas.forEach(function(pizza) {
        //create box that will contain pizza information
        const div = document.createElement('div');
        div.setAttribute('class', 'pizza');
        div.setAttribute('data-key', pizza.id);

        //chillies hold <img> tags to render appropriate number of chillies
        let chillies = '';
        for(let i = 0; i < pizza.heat; i++) {
            chillies += "<img src='images/chilli.png' alt=''/>";
        }

        //contents of pizza div depend on wether pizza photo was selected
        if(pizza.photo) {
            div.innerHTML = `
            <button class="delete-button">X</button>
            <img src=${pizza.photo} alt=""/>
            <div class="pizza-info">
                <p>${pizza.name} `+ chillies +`</p>
                <p>${pizza.price} &euro;</p>
                <p>Toppings: <span class="pizza-toppings">${pizza.toppings.join(', ')}</span></p>
            </div>
            `;
        } 
        else {
            div.innerHTML = `
            <button class="delete-button">X</button>
            <div class="pizza-info">
                <p>${pizza.name} `+ chillies +`</p>
                <p>${pizza.price} &euro;</p>
                <p>Toppings: <span class="pizza-toppings">${pizza.toppings.join(', ')}</span></p>
            </div>
            `;
        }
        pizzaMenu.append(div);
    });
}

//stores pizza object within session storage and renders object into the browser
function addToSessionStorage(pizzas) {
    sessionStorage.setItem('pizzas', JSON.stringify(pizzas));
    pizzas = filterPizzasBy(filter, pizzas);
    renderPizzas(pizzas);
}

//Get pizzas from session storage
function getFromSessionStorage(filter) {
    const reference = sessionStorage.getItem('pizzas');
    if(reference) {
        pizzas = JSON.parse(reference);
        pizzas = filterPizzasBy(filter, pizzas);
        renderPizzas(pizzas);
    }
}

//pizzas are deleted by their unique data key
function deletePizza(id) {
    if(confirm('Are you sure you want to remove this pizza from the menu?')){
        pizzas = pizzas.filter(function(pizza) {
            return pizza.id != id;
        });
        addToSessionStorage(pizzas);
    }
}

//calling it initially loads earlier submitted pizzas
getFromSessionStorage(filter);

pizzaMenu.addEventListener('click', function(event) {
    if(event.target.classList.contains('delete-button')) {
        deletePizza(event.target.parentElement.getAttribute('data-key'));
    }
});



//function for filtering pizza objects by different filters
function filterPizzasBy(filter, pizzas) {
    if(filter === 'by-name') {
        pizzas.sort(function(a,b) {
            let nameA = a.name.toUpperCase();
            let nameB = b.name.toUpperCase();
            if(nameA < nameB) {
                return -1;
            }
            if (nameA > nameB){
                return 0;
            }
        });     
    }
    else if(filter === 'by-price') {
        pizzas.sort(function(a,b) {
            return a.price - b.price ;
        }) 
    }
    else if(filter === 'by-heat') {
        pizzas.sort(function(a,b) {
            return b.heat - a.heat ;
        })
    }
    return pizzas;
}

//Event listener for filter selection
document.querySelector('.filter').addEventListener('click', function() {
    filter = document.querySelector('input[name="filter"]:checked').value;
        if(filter === 'by-name') {
        nameLabel.classList.add('selected-filter');
        priceLabel.classList.remove('selected-filter');
        heatLabel.classList.remove('selected-filter');        
    }
    else if(filter === 'by-price') {
        nameLabel.classList.remove('selected-filter');
        priceLabel.classList.add('selected-filter');
        heatLabel.classList.remove('selected-filter');  
    }
    else if(filter === 'by-heat') {
        nameLabel.classList.remove('selected-filter');
        priceLabel.classList.remove('selected-filter');
        heatLabel.classList.add('selected-filter');  
    }
    getFromSessionStorage(filter);
})

