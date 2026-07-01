var allProducts = [];
var currentCategory = "all";
var currentSort = "default";
var currentSearch = "";

function showPage(name) {
    var pages = document.querySelectorAll(".page");
    for (var i = 0; i < pages.length; i++) {
        pages[i].classList.remove("active");
    }
    document.getElementById("page-" + name).classList.add("active");

    var navItems = document.querySelectorAll(".nav-links li");
    for (var j = 0; j < navItems.length; j++) {
        navItems[j].classList.remove("active");
        if (navItems[j].dataset.page === name) {
            navItems[j].classList.add("active");
        }
    }

    var menu = document.querySelector(".nav-links");
    menu.classList.remove("open");

    window.scrollTo(0, 0);
}

function goHome() {
    showPage("home");
    loadFeaturedProducts();
}

function goProducts() {
    showPage("products");
    if (allProducts.length === 0) {
        loadAllProducts();
    } else {
        renderProducts();
    }
}

function goAbout() {
    showPage("about");
}

function goContact() {
    showPage("contact");
}

function goDetail(id) {
    showPage("detail");
    loadProductDetail(id);
}

function makeCard(p) {
    var div = document.createElement("div");
    div.className = "product-card";
    div.innerHTML =
        '<img src="' + p.image + '" alt="' + p.name + '" loading="lazy">' +
        '<div class="card-body">' +
        '<p class="card-category">' + p.category + '</p>' +
        '<p class="card-name">' + p.name + '</p>' +
        '<p class="card-price">$' + p.price.toFixed(2) + '</p>' +
        '<p class="card-rating">Rating: ' + p.rating + ' / 5</p>' +
        '<button class="card-btn">View Details</button>' +
        '</div>';
    div.querySelector(".card-btn").addEventListener("click", function() {
        goDetail(p.id);
    });
    div.querySelector("img").addEventListener("click", function() {
        goDetail(p.id);
    });
    return div;
}

async function loadFeaturedProducts() {
    var container = document.getElementById("featured-grid");
    container.innerHTML = '<p class="loading-msg">Loading...</p>';
    try {
        var res = await fetch("/api/products");
        var data = await res.json();
        var featured = data.slice(0, 4);
        container.innerHTML = "";
        for (var i = 0; i < featured.length; i++) {
            container.appendChild(makeCard(featured[i]));
        }
    } catch (err) {
        container.innerHTML = '<p class="error-msg">Could not load products.</p>';
    }
}

async function loadAllProducts() {
    var container = document.getElementById("products-grid");
    container.innerHTML = '<p class="loading-msg">Loading products...</p>';
    try {
        var res = await fetch("/api/products");
        allProducts = await res.json();
        loadCategories();
        renderProducts();
    } catch (err) {
        container.innerHTML = '<p class="error-msg">Failed to load products. Is the server running?</p>';
    }
}

async function loadCategories() {
    var select = document.getElementById("category-filter");
    try {
        var res = await fetch("/api/categories");
        var cats = await res.json();
        for (var i = 0; i < cats.length; i++) {
            var opt = document.createElement("option");
            opt.value = cats[i];
            opt.textContent = cats[i];
            select.appendChild(opt);
        }
    } catch (err) {
        console.log("could not load categories");
    }
}

function getFilteredProducts() {
    var list = allProducts.slice();

    if (currentCategory !== "all") {
        list = list.filter(function(p) {
            return p.category === currentCategory;
        });
    }

    if (currentSearch.trim() !== "") {
        var q = currentSearch.toLowerCase();
        list = list.filter(function(p) {
            return p.name.toLowerCase().indexOf(q) !== -1 ||
                p.category.toLowerCase().indexOf(q) !== -1 ||
                p.description.toLowerCase().indexOf(q) !== -1;
        });
    }

    if (currentSort === "price-asc") {
        list.sort(function(a, b) { return a.price - b.price; });
    } else if (currentSort === "price-desc") {
        list.sort(function(a, b) { return b.price - a.price; });
    } else if (currentSort === "rating") {
        list.sort(function(a, b) { return b.rating - a.rating; });
    } else if (currentSort === "name") {
        list.sort(function(a, b) { return a.name.localeCompare(b.name); });
    }

    return list;
}

function renderProducts() {
    var container = document.getElementById("products-grid");
    var countEl = document.getElementById("results-count");
    var list = getFilteredProducts();

    countEl.textContent = "Showing " + list.length + " product" + (list.length !== 1 ? "s" : "");

    if (list.length === 0) {
        container.innerHTML = '<p class="no-products">No products match your search or filter.</p>';
        return;
    }

    container.innerHTML = "";
    for (var i = 0; i < list.length; i++) {
        container.appendChild(makeCard(list[i]));
    }
}

async function loadProductDetail(id) {
    var container = document.getElementById("detail-content");
    container.innerHTML = '<p class="loading-msg">Loading...</p>';
    try {
        var res = await fetch("/api/products/" + id);
        if (!res.ok) {
            container.innerHTML = '<p class="error-msg">Product not found.</p>';
            return;
        }
        var p = await res.json();
        container.innerHTML =
            '<div class="detail-layout">' +
            '<div><img class="detail-img" src="' + p.image + '" alt="' + p.name + '"></div>' +
            '<div>' +
            '<p class="detail-category">' + p.category + '</p>' +
            '<h1 class="detail-name">' + p.name + '</h1>' +
            '<p class="detail-price">$' + p.price.toFixed(2) + '</p>' +
            '<p class="detail-rating">Rating: ' + p.rating + ' / 5</p>' +
            '<p class="detail-desc">' + p.description + '</p>' +
            '<p class="detail-stock">Availability: <span>' + (p.stock > 0 ? "In Stock (" + p.stock + " left)" : "Out of Stock") + '</span></p>' +
            '<button class="btn btn-primary" style="width:100%;padding:12px;font-size:15px;" onclick="alert(\'Cart feature coming soon!\')">Add to Cart</button>' +
            '</div>' +
            '</div>';
    } catch (err) {
        container.innerHTML = '<p class="error-msg">Something went wrong. Try again.</p>';
    }
}

function setupFilters() {
    document.getElementById("search-input").addEventListener("input", function() {
        currentSearch = this.value;
        renderProducts();
    });

    document.getElementById("category-filter").addEventListener("change", function() {
        currentCategory = this.value;
        renderProducts();
    });

    document.getElementById("sort-select").addEventListener("change", function() {
        currentSort = this.value;
        renderProducts();
    });
}

function setupNav() {
    document.querySelector(".nav-brand").addEventListener("click", goHome);

    var items = document.querySelectorAll(".nav-links li");
    items.forEach(function(item) {
        item.addEventListener("click", function() {
            var page = this.dataset.page;
            if (page === "home") goHome();
            else if (page === "products") goProducts();
            else if (page === "about") goAbout();
            else if (page === "contact") goContact();
        });
    });

    document.querySelector(".hamburger").addEventListener("click", function() {
        document.querySelector(".nav-links").classList.toggle("open");
    });
}

function setupFooterLinks() {
    document.getElementById("footer-home").addEventListener("click", goHome);
    document.getElementById("footer-products").addEventListener("click", goProducts);
    document.getElementById("footer-about").addEventListener("click", goAbout);
    document.getElementById("footer-contact").addEventListener("click", goContact);
}

function setupContact() {
    var form = document.getElementById("contact-form");
    form.addEventListener("submit", function(e) {
        e.preventDefault();
        document.getElementById("form-success").style.display = "block";
        form.reset();
    });
}

document.addEventListener("DOMContentLoaded", function() {
    setupNav();
    setupFilters();
    setupFooterLinks();
    setupContact();
    goHome();
});
