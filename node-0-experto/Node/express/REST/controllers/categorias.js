const { response } = require('express');
// importar modelo categoria
const { Categoria } = require('../models');

// obtenerCategorias - paginado - total - populate
const obtenerCategorias = async ( req, res = response ) => {

    const { limite = 5, desde = 0 } = req.query;
    const query = { estado:true }

    // paginación
    const [ total, categorias] = await Promise.all([
        Categoria.countDocuments(query),
        Categoria.find(query)
            // mostrar el nombre y no el id
            .populate('usuario', 'nombre')
            .skip( Number( desde ))
            .limit( Number( limite ))
    ]);

    res.json({
        total,
        categorias
    })

}

// obtenerCategoria - populate {}
const obtenerCategoria = async ( req, res = response ) => {
    const { id } = req.params;
    const categoria = await Categoria.findById( id ).populate('usuario','nombre');
    res.json( categoria );
}

const crearCategoria = async ( req, res = response ) => {
    
    // mayúscula el nombre
		const nombre = req.body.nombre.toUpperCase();

    // buscar si la categoria existe
		const categoriaDB = await Categoria.findOne({ nombre });

    // si la categoria existe
    if ( categoriaDB ) {
        return res.status(400).json({
            msg: `La categoria ${ categoriaDB.nombre }, ya existe`
        });
    }

    // generar la data a guardar
    const data = {
        nombre,
        usuario: req.usuario._id
    }

    const categoria = new Categoria( data );

    // guardar DB
    await categoria.save()

    res.status(201).json(categoria)
}

// actualizar categoria
const actualizarCategoria = async ( req, res = response ) => {

    const { id } = req.params;
    const { estado, usuario, ...data } = req.body;

    data.nombre = data.nombre.toUpperCase();
    data.usuario = req.usuario._id;

    const categoria = await Categoria.findByIdAndUpdate(id, data, { mew:true })

    res.json( categoria );
}

// borrarCategoria - estado:false
const borrarCategoria = async ( req, res = response ) => {
    const { id } = req.params;
    const categoriaBorrada = await Categoria.findByIdAndUpdate( id, { estado: false }, { new: true });
    res.json(categoriaBorrada)
}

module.exports = {
    crearCategoria,
    obtenerCategorias,
    obtenerCategoria,
    actualizarCategoria,
    borrarCategoria
}