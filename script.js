let categoriaProductos = ["Amigurumi", "Remera", "Photocard"]

let productos=[
    {
        id: "RJ1",
        categoria: "Amigurumi",
        nombre: "Llavero RJ",
        cantidad: 5,
        precio: 3500
    },
    {
        id: "Koya1",
        categoria: "Amigurumi",
        nombre: "Llavero Koya",
        cantidad: 6,
        precio: 3500
    },
    {
        id: "Tata15cm",
        categoria: "Amigurumi",
        nombre: "Tata 15cm",
        cantidad: 3,
        precio: 5000
    },
    {
        id: "Chimmy30cm",
        categoria: "Amigurumi",
        nombre: "Chimmy 30cm",
        cantidad: 7,
        precio: 7000
    },
    {
        id: "SVTLogoM",
        categoria: "Remera",
        nombre: "Remera bordada Seventeen",
        talle: "M",
        cantidad: 2,
        precio: 8000
    },
    {
        id: "AteezLogoS",
        categoria: "Remera",
        nombre: "Remera bordada Ateez",
        talle: "S",
        cantidad: 2,
        precio: 8000
    },
    {
        id: "BT21x10",
        categoria: "Photocard",
        nombre: "10 photocards BT21",
        cantidad: 2,
        precio: 3000
    },
    {
        id: "VAVx10",
        categoria: "Photocard",
        nombre: "10 photocards VAV",
        cantidad: 2,
        precio: 3000
    },
    {
        id: "VAVx50",
        categoria: "Photocard",
        nombre: "50 photocards VAV",
        cantidad: 1,
        precio: 10000
    }
]

const mensajeLista = arrayMensaje =>{
    let listado = ""
    for(let i=0; i<arrayMensaje.length; i++){
        listado = listado + (i+1) + "= " + arrayMensaje[i] + "\n"   
    }
    return listado
}

const elegirCateogriaProducto = categoria =>{

    let productosCategoria = []
    if(validarValorIngresado(categoria, categoriaProductos)){
        for(producto of productos){
            if(producto.categoria === categoriaProductos[categoria - 1] && producto.cantidad > 0){
                productosCategoria.push(producto.nombre)
            }
        }
        if(productosCategoria.length > 0)
        {
            return productosCategoria
        }
        else
        {
            alert("Ya no tenemos productos de esa categoría.\nIntente nuevamente")
            return false
        }
    }
    else
    {
        return false
    }
}

const elegirProducto = function(saldo, listado, valorElegido){
    if(validarValorIngresado(valorElegido, listado)){
        for(producto of productos){
            if(producto.nombre === listado[valorElegido - 1]){
                producto.cantidad = producto.cantidad - 1
                return saldo + producto.precio
            }
        }
    }
    else
    {
        return saldo
    }
}

function validarValorIngresado(valor, lista){
    if(valor <= 0 || valor > lista.length){
        alert("El valor ingresado no es válido.\nIntente nuevamente")
        return false
    }
    else
    {
        return true
    }
}

alert("¡Bienvenido a Hoshirane.ar!")

let saldo = 0 //Saldo a pagar
let confirmar = confirm("¿Le gustaría conocer nuestros productos?")

while(confirmar){
    let listaMensaje = mensajeLista(categoriaProductos) //Es la lista que se agrega a los mensajes
    let valorElegidoMensaje = parseInt(prompt("¿Qué clase de producto está buscando? Por favor, indique con el número\n" + listaMensaje)) //Es el valor elegido en cada mensaje
    let listado = elegirCateogriaProducto(valorElegidoMensaje) //Es el listado utilizado para cada mensaje
    if(listado !== false)
    {
        listaMensaje = mensajeLista(listado)
        valorElegidoMensaje = parseInt(prompt("¿Qué producto está buscando? Por favor, indique con el número\n" + listaMensaje))
        saldo = elegirProducto(saldo, listado, valorElegidoMensaje)
        confirmar = confirm("Hasta ahora debe pagar $" + saldo + ", ¿desea continuar?")
    }
}


alert("Saldo final a pagar: $" + saldo)
alert("¡Que tenga un buen día!")