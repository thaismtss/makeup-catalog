
const BASE_URL = "http://makeup-api.herokuapp.com/api/v1/products.json";

const itemsPerPage = 10;
let currentPage = 0;
let productsMakeUp = []

async function getProducts(filters = {}) {
    try {
        const response = await fetch(BASE_URL + '?' + new URLSearchParams(filters))
        const products = await response.json()
        return products

    } catch(e) {
        console.log(e)
    }
}

function templateProduct(product) {
  return `
    <div class="product" data-name="${product.name}" onclick="showDetails('${product.name}')">
        <img src="${product.image_link}" width="215" height="215" 
            alt="${product.name}"
            onerror="javascript:this.src='./default.jpg'">
        <h3 class="product-name">${product.name}</h3>
        <p class="product-brand">${product.brand}</p>
        <p class="product-price">R$ ${product.price.toFixed(2)}</p>
        <div class="product-detail" style="display: none;">
            <span>Brand: ${product.brand}</span>
            <span>Price: R$ ${product.price.toFixed(2)}</span>
            <span>Category: ${product.category}</span>
            <span>Rating: ${product.rating}</span>
        </div>
    </div>
    `;
}

function sortProducts(products, order) {
  const sorters = {
    'rating': (a, b) => b.rating - a.rating,
    'maiores-precos': (a, b) => b.price - a.price,
    'menores-precos': (a, b) => a.price - b.price,
    'nome': (a, b) => a['name'].localeCompare(b['name']),
    'nome-desc': (a, b) => b['name'].localeCompare(a['name']),
  };

  if (order === 'rating') {
    return products.sort((a, b) => b.rating - a.rating || b.price - a.price);
  }
  return products.sort(sorters[order]);
}

function createMappedProduct(product) {
  return {
    image_link: product.image_link,
    name: product.name || '',
    brand: product.brand || '',
    price: Number((product.price || 0) * 5.5),
    category: product.category || '',
    rating: product.rating || 0
  };
}

async function filterProducts() {
  const product_type = document.getElementById("productType");
  const brand = document.getElementById("brand");
  const order = document.getElementById("order").value;
  const name = document.getElementById("name");
  const inputName = name.value.trim().toLowerCase() || '';
  const productContainer = document.querySelector(".products-container");
  productContainer.innerHTML = '';

  const params = {
    product_type: product_type.value || '',
    brand: brand.value || ''
  };
  
  productsMakeUp = await getProducts(params)

  if (inputName) {
    productsMakeUp = productsMakeUp.filter((product) =>
      product.name?.trim().toLowerCase().startsWith(inputName)
    );
  }

  if (order) {
    productsMakeUp = sortProducts(productsMakeUp, order)
  }

  loadMoreProducts()
}

function showDetails(name) {
  const details = document.querySelector(`[data-name="${name}"] .product-detail`);
  return details.style.display === 'none' ? details.style.display = 'flex' : details.style.display = 'none';
}

async function renderProducts(products) {
    const productContainer = document.querySelector('.products-container');
    
    for (const product of products) {
      const mapProduct = createMappedProduct(product)
  
      const productCreated = templateProduct({ ...mapProduct });
      productContainer.insertAdjacentHTML('beforeend', productCreated);
    }
  }

function loadMoreProducts() {
    const startIndex = currentPage * itemsPerPage;
    const endIndex = (currentPage + 1) * itemsPerPage;
    const products = productsMakeUp.slice(startIndex, endIndex);
    renderProducts(products);
}

async function main() {
    productsMakeUp = await getProducts()
    loadMoreProducts()
    currentPage = 1

    window.addEventListener('scroll', () => {
        if (document.documentElement.scrollHeight - window.innerHeight <= window.scrollY) {
            loadMoreProducts();
            currentPage++;
        }
      });

}

main()