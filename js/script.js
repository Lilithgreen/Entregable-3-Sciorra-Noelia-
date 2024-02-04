//Inicializo de variables
let productosComprados = [{precio: 0, cantidad: 0}]
let productos = []

//Se inicializa la obtención de elementos necesaria
const botonBuscarFiltro = document.getElementById("filtrarProducto")
const seleccionCategoria = document.getElementById("buscadorProductoCategoria")
const seleccionPrecio = document.getElementById("buscadorProductoPrecio")
const tablaProductos = document.getElementById("productosComprados")
const saldoAPagar = document.getElementById("saldoFinal")
const pagarProductos = document.getElementById("confirmarPago")

//Funciones
//Inicializa mediante el uso de promesas el contenido de la página
function InicializacionPagina(){
    fetch('json/productos.json')
    .then(response => response.json())
    .then(data => new Promise(() => {
            productosOriginal = data
            listadoCategoriaProductos(productosOriginal) //Se inicializa el contenido dentro del menú desplegable de categorías
            inicializacionStock(productosOriginal, productosComprados) //Configura el stock (y si hay algo para colocar en el carrito) al cargar la página
            mostrarProductos(productos) //Se inicializa el contenido a mostrar
    }))
}
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
                <button class="btn btn-primary" type="button" onclick="cantidadProductoAComprar('${producto.id}', ${producto.cantidad})">Pagar</button>
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

//Permite seleccionar la cantidad a comprar de un cierto producto
const cantidadProductoAComprar = (idProductoComprado, cantidadMaximaProducto) => {
    const {value: cantidad} = Swal.fire({
        title: "Cantidad",
        text: "¿Cuántos desea comprar? Maximo " + cantidadMaximaProducto + " unidades",
        input: "number",
        inputPlaceholder: "Ingrese cantidad",
        confirmButtonText: "Agregar al carrito",
        confirmButtonColor: "#f8a232",
        showCancelButton: true,
        cancelButtonText: "Cancelar",
        inputValidator: value => {
            if(value <= 0 || value > cantidadMaximaProducto){
                return "Cantidad ingresada no válida"
            }
        }
    }).then((result) => {
        if (result.isConfirmed) {
            agregarProductoACarrito(idProductoComprado, parseInt(result.value)) //Se convierte a int el valor porque si no lo pasa como string
            Swal.fire({
                title: "Agregado al carrito",
                icon: "success",
                confirmButtonColor: "#f8a232",
                confirmButtonText: "Confirmar"
            });
        } else {
            Swal.fire({
                text: "Compra cancelada",
                icon: "info"
            });
        }
    });
}

//Agrega un producto al carrito y muestra los productos restantes del filtro seleccionado anteriormente
const agregarProductoACarrito = (idProductoComprado, cantidadComprada) => {
    if(calcularSaldoAPagar(productosComprados) === 0) //Revisa si el contenido de productosComprados es nulo. Esto evita tener un primer elemento en la lista que sea undefined
    {
        productosComprados = []
    }
    let indiceDelProducto = productos.findIndex(el => el.id === idProductoComprado) //Busca el producto que se mandó al carrito dentro del stock total disponible
    if(productos[indiceDelProducto].cantidad - cantidadComprada >= 0) //Evita que ante un problema haya cantidad negativa en stock. Necesario para cuando se suma stock dentro del carrito
    {
        productos[indiceDelProducto].cantidad -= cantidadComprada
        if(productosComprados.find(productoComprado => productoComprado.id === idProductoComprado)){ //Revisa si en el carrito ya tenía otro del mismo id
            let indiceDelProductoEnCarrito = productosComprados.findIndex(el => el.id === idProductoComprado) //Busca en el carrito el proucto agregado anteriormente para sumarle la nueva cantidad
            productosComprados[indiceDelProductoEnCarrito].cantidad += cantidadComprada
        }
        else{
            productosComprados.push({
                id: productos[indiceDelProducto].id,
                nombre: productos[indiceDelProducto].nombre,
                precio: productos[indiceDelProducto].precio,
                cantidad: cantidadComprada
            })
        }
    }
    else{
        Swal.fire({
            title: "Stock insuficiente",
            text: "No hay más stock del producto seleccionado",
            icon: "error"
            });
    }
    actualizarStock(productosComprados, productos)
}

//Saca un producto del carrito
const sacarProductoDeCarrito = idProductoSacado => {
    let indiceDelProducto = productos.findIndex(el => el.id === idProductoSacado)
    productos[indiceDelProducto].cantidad += 1
    let indiceDelProductoEnCarrito = productosComprados.findIndex(el => el.id === idProductoSacado)
    if(productosComprados[indiceDelProductoEnCarrito].cantidad > 1){
        productosComprados[indiceDelProductoEnCarrito].cantidad -= 1
    }
    else{
        productosComprados = productosComprados.filter(el => el.id !== idProductoSacado)
        if(productosComprados.length === 0){
            productosComprados = [{precio: 0, cantidad: 0}]
        }
    }
    actualizarStock(productosComprados, productos)
}

//Actualiza el stock disponible y en carrito, ya sea porque se agregó o sacó un producto del carrito
const actualizarStock = (productosComprados, productos) => {
    mostrarProductosTabla(productosComprados)
    guardarEstadoCompra(productos, productosComprados)
    const stockRemanente = filtroProductos(productos, seleccionCategoria.value, seleccionPrecio.value)
    mostrarProductos(stockRemanente)
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
    if(calcularSaldoAPagar(productosCompradosTabla) > 0) //Valida que haya que agregar contenido a la tabla. Caso contrario, la reestablece
    {
        productosCompradosTabla.forEach(producto => {
            const productoAMostrar = document.createElement("tr")
            productoAMostrar.innerHTML = 
            `
            <td>${producto.nombre}</td>
            <td>${producto.precio}</td>
            <td class="productosCompradosCantidad">
                <button class="btn btn-danger" type="button" onclick="sacarProductoDeCarrito('${producto.id}')">-</button>
                ${producto.cantidad}
                <button class="btn btn-success" type="button" onclick="agregarProductoACarrito('${producto.id}', 1)">+</button>
            </td>
            `
            productoEnCarrito.push(productoAMostrar)
        })
    }
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
        Swal.fire({
            title: "Sin stock",
            text: "Lo siento, no tenemos productos con las especificaciones realizadas",
            icon: "warning",
            confirmButtonColor: "#f8a232",
            confirmButtonText: "Confirmar"
          });
    }
}

//Confirma la compra de los productos
pagarProductos.onclick = () => {
    if(calcularSaldoAPagar(productosComprados) === 0)
    {
        Swal.fire({
            title: "Sin stock",
            text: "Disculpe, pero aún no ha comprado nada",
            icon: "error",
            confirmButtonColor: "#f8a232",
            confirmButtonText: "Confirmar"
          });
    }
    else
    {
        productosComprados = [{precio: 0, cantidad: 0}]
        mostrarSaldoAPagar(productosComprados)
        mostrarProductosTabla(productosComprados)
        guardarCompraFinalizada(productos)

        Swal.fire({
            title: "Compra confirmada",
            text: "Producto pagado. ¡Que tenga buen día!",
            icon: "success",
            confirmButtonColor: "#f8a232",
            confirmButtonText: "Confirmar"
          });
    }
}

//Inicializo el contenido original que hay en stock
//Ejecución incial de funciones
//reinicioEjecucion() //Reinicia stock y carrito --> Usarlo para probar el funcionamiento de la página
InicializacionPagina()