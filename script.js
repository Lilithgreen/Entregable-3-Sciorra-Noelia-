const productosOriginal=[
    {
        id: "RJ1",
        categoria: "Amigurumi",
        nombre: "Llavero RJ",
        cantidad: 5,
        precio: 3500,
        imagen: "Img/IMG_20230713_140321507.jpg"
    },
    {
        id: "Koya1",
        categoria: "Amigurumi",
        nombre: "Llavero Koya",
        cantidad: 6,
        precio: 3500,
        imagen: "Img/IMG_20230713_140321507.jpg"
    },
    {
        id: "Tata15cm",
        categoria: "Amigurumi",
        nombre: "Tata 15cm",
        cantidad: 3,
        precio: 5000,
        imagen: "Img/IMG_20230713_140321507.jpg"
    },
    {
        id: "Chimmy30cm",
        categoria: "Amigurumi",
        nombre: "Chimmy 30cm",
        cantidad: 7,
        precio: 7000,
        imagen: "Img/IMG_20230713_140321507.jpg"
    },
    {
        id: "SVTLogoM",
        categoria: "Remera",
        nombre: "Remera bordada Seventeen",
        talle: "M",
        cantidad: 2,
        precio: 8000,
        imagen: "Img/IMG_20230713_140321507.jpg"
    },
    {
        id: "AteezLogoS",
        categoria: "Remera",
        nombre: "Remera bordada Ateez",
        talle: "S",
        cantidad: 2,
        precio: 8000,
        imagen: "Img/IMG_20230713_140321507.jpg"
    },
    {
        id: "BT21x10",
        categoria: "Photocard",
        nombre: "10 photocards BT21",
        cantidad: 2,
        precio: 3000,
        imagen: "Img/IMG_20230713_140321507.jpg"
    },
    {
        id: "VAVx10",
        categoria: "Photocard",
        nombre: "10 photocards VAV",
        cantidad: 2,
        precio: 3000,
        imagen: "Img/IMG_20230713_140321507.jpg"
    },
    {
        id: "VAVx50",
        categoria: "Photocard",
        nombre: "50 photocards VAV",
        cantidad: 1,
        precio: 10000,
        imagen: "Img/IMG_20230713_140321507.jpg"
    }
]


//Inicializo de variables
let productosComprados = [{precio: 0, cantidad: 0}]
let productos = []

//Se inicializa la obtención de elementos necesaria
const botonBuscarFiltro = document.getElementById("filtrarProducto")
const seleccionCategoria = document.getElementById("buscadorProductoCategoria")
const seleccionPrecio = document.getElementById("buscadorProductoPrecio")
const tablaProductos = document.getElementById("productosComprados")
const saldoAPagar = document.getElementById("saldoFinal")
const sinStock = document.getElementById("sinStock")
const pagarProductos = document.getElementById("confirmarPago")
const pagoConfirmado = document.getElementById("pagoConfirmado")

//Funciones
//Inicializa el stock disponible de productos
const inicializacionStock = (productosOriginal, productosEnCarrito) => {
    if(localStorage.getItem("stockDisponible") === null && sessionStorage.getItem("carritoOcupado") === null){ //Cuando aún no se compró nada ni se guardó en carrito
        productos = productosOriginal
        mostrarSaldoAPagar(productosEnCarrito)
    }
    else if(sessionStorage.getItem("carritoOcupado") !== null) //El carrito tenía algo y se refrescó la página
    {
        productos = JSON.parse(sessionStorage.getItem("stockConCarritoOcupado"))
        productosComprados = JSON.parse(sessionStorage.getItem("carritoOcupado"))
        mostrarProductosTabla(productosComprados)
    }
    else{ //Stock remanente al recargar la página
        productos = JSON.parse(localStorage.getItem("stockDisponible"))
        mostrarSaldoAPagar(productosEnCarrito)
    }
}

//Muestra los productos solicitados por el usuario (ya habiéndolos filtrado, en caso de ser necesario)
const mostrarProductos = listaProductosAMostrar => {
    //Valida si hay que limpiar el listado de productos mostrados
    const limpiarListado = document.querySelectorAll("div.cartaProducto") //Revisa todos los productos
    if(limpiarListado.length > 0){
        limpiarListado.forEach(producto => producto.remove())
    }
    sinStock.innerHTML = ``
    const listadoProductos = document.getElementById("productosSeleccionados")
    const productoDisponible = []
    listaProductosAMostrar.forEach(producto => {
        if(producto.cantidad > 0)
        {
            const carta = document.createElement("div")
            carta.className = "col-3 cartaProducto"
            carta.innerHTML = 
            `
            <div class="card" style="width: 18rem;">
            <img src="${producto.imagen}" class="card-img-top" alt="Imagen">
                <div class="card-body">
                <h5 class="card-title">${producto.nombre}</h5>
                <p class="card-text">Precio: $${producto.precio}</p>
                <p class="card-text">Cantidad disponible: ${producto.cantidad}</p>
                <button id="${producto.id}" class="btn btn-primary" type="button" onclick="comprarProducto('${producto.id}')">Pagar</button>
                </div>
            </div>`
            productoDisponible.push(carta)
        }
    })
    listadoProductos.append(...productoDisponible)
}

//Genera el menú desplegable con la categoría de los productos
const listadoCategoriaProductos = function(productosACategorizar) {
    const categoriaProductosArray = [] //Contiene las categorías sin repetir
    const listacategoriaProductos = [] //Valores agregados al menú desplegable
    productosACategorizar.forEach((producto) => {
        if(!categoriaProductosArray.includes(producto.categoria)){
            categoriaProductosArray.push(producto.categoria)
        }
    })
    categoriaProductosArray.forEach(categoria => {
        const categoriaProducto = document.createElement("option")
        categoriaProducto.textContent = categoria
        categoriaProducto.value = categoria
        listacategoriaProductos.push(categoriaProducto)
    })
    seleccionCategoria.append(...listacategoriaProductos)
}

//Filtra la lista de productos, teniendo en cuenta el filtro que se colocó
const filtroProductos = (listaProductos, filtroCategoria, filtroPrecio) => {
    let listaFiltrada = listaProductos.map(producto => producto) //Lista resultante (primero vale todo el contenido disponible, y a eso se le va aplicando el filtro)
    if(filtroCategoria !== "SinFiltrar"){
        listaFiltrada = listaFiltrada.filter(producto => producto.categoria === filtroCategoria && producto.cantidad > 0)
    }
    if(filtroPrecio !== ""){
        filtroPrecio = parseInt(filtroPrecio)
        listaFiltrada = listaFiltrada.filter(producto => producto.precio <= filtroPrecio && producto.cantidad > 0)
    }
    return listaFiltrada
}

//Agrega un producto a pagar y muestra los productos restantes del filtro seleccionado anteriormente
const comprarProducto = idProductoComprado => {
    if(calcularSaldoAPagar(productosComprados) === 0) //Revisa si el contenido de productosComprados es nulo. Esto evita tener un primer elemento en la lista que sea undefined
    {
        productosComprados = []
    }
    productos.forEach(producto =>{
        if(producto.id === idProductoComprado){ //Busca cuál es el producto que se compró
            producto.cantidad -= 1
            if(productosComprados.find(productoComprado => productoComprado.id === idProductoComprado)){ //Revisa si en el carrito ya tenía otro del mismo id
                productosComprados.forEach(productoAgregado => {
                    if(productoAgregado.id === idProductoComprado){ //Recorre el carrito para sumarle 1 al producto con el mismo id
                        productoAgregado.cantidad += 1
                    }
                })
            }
            else{
                productosComprados.push({
                    id: producto.id,
                    nombre: producto.nombre,
                    precio: producto.precio,
                    cantidad: 1
                })
            }
        }
    })
    mostrarProductosTabla(productosComprados)
    guardarEstadoCompra(productos, productosComprados)
    const stockRemanente = filtroProductos(productos, seleccionCategoria.value, seleccionPrecio.value)
    mostrarProductos(stockRemanente)
    if(stockRemanente.length === 0){
        sinStock.innerHTML = `<h2>Lo siento, ya no tenemos más stock del filtro aplicado</h2>` 
    }
}

//Calcula el saldo final a pagar
const calcularSaldoAPagar = productosComprados => productosComprados.reduce((saldo, producto) => saldo + producto.precio * producto.cantidad, 0)

//Edita el saldo final a pagar
const mostrarSaldoAPagar = productosComprados => {
    saldoAPagar.innerHTML = `<h1>Saldo total a pagar: $${calcularSaldoAPagar(productosComprados)}</h1>`
}

//Agrega productos comprados a la tabla
const mostrarProductosTabla = productosCompradosTabla => {
    const productoEnCarrito = []
    tablaProductos.innerHTML = ``
    productosCompradosTabla.forEach(producto => {
        const productoAMostrar = document.createElement("tr")
        productoAMostrar.innerHTML = 
        `
        <td>${producto.nombre}</td>
        <td>${producto.precio}</td>
        <td>${producto.cantidad}</td>
        `
        productoEnCarrito.push(productoAMostrar)
    })
    tablaProductos.append(...productoEnCarrito)
    mostrarSaldoAPagar(productosCompradosTabla)
}

//Guarda los productos que había en la tabla en forma provisoria
const guardarEstadoCompra = (estadoProductosActual, estadoCarritoActual) => {
    sessionStorage.setItem("stockConCarritoOcupado", JSON.stringify(estadoProductosActual)) //Guarda el estado actual de los productos con el carrito ocupado
    sessionStorage.setItem("carritoOcupado", JSON.stringify(estadoCarritoActual)) //Guarda el etado actual del carrito
}

//Guarda en storage el nivel de stock actual y elimina en storage el estado del carrito
const guardarCompraFinalizada = productosStock => {
    localStorage.setItem("stockDisponible", JSON.stringify(productosStock))
    sessionStorage.removeItem("carritoOcupado")
    sessionStorage.removeItem("stockConCarritoOcupado")
}

//Reinicia programa
const reinicioEjecucion = function(){
    sessionStorage.removeItem("carritoOcupado")
    sessionStorage.removeItem("stockConCarritoOcupado")
    localStorage.removeItem("stockDisponible") 
}

//Botones
//Aplica los filtros
botonBuscarFiltro.onclick = () => {
    const productosFiltrados = filtroProductos(productos, seleccionCategoria.value, seleccionPrecio.value)
    if(productosFiltrados.length > 0){
        mostrarProductos(productosFiltrados)
    }
    else {
        sinStock.innerHTML = `<h2>Lo siento, no tenemos productos con las especificaciones realizadas</h2>`
    }
}

//Confirma la compra de los productos
pagarProductos.onclick = () => {
    if(calcularSaldoAPagar(productosComprados) === 0)
    {
        pagoConfirmado.innerHTML = `<h2>Disculpe, pero no ha comprado nada</h2>`
    }
    else
    {
        sinStock.innerHTML = ``
        productosComprados = [{precio: 0, cantidad: 0}]
        mostrarSaldoAPagar(productosComprados)
        mostrarProductosTabla(productosComprados)
        guardarCompraFinalizada(productos)
        pagoConfirmado.innerHTML = `<h2>Producto pagado. ¡Que tenga buen día!</h2>`
    }
}



//Ejecución incial de funciones
//reinicioEjecucion() //Reinicia stock y carrito --> Usarlo para probar el funcionamiento de la página

listadoCategoriaProductos(productosOriginal) //Se inicializa el contenido dentro del menú desplegable de categorías
inicializacionStock(productosOriginal, productosComprados) //Configura el stock (y si hay algo para colocar en el carrito) al cargar la página
mostrarProductos(productos) //Se inicializa el contenido a mostrar
