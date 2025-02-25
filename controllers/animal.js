'use strict'

//modulos
var fs = require('fs');
var path = require('path');

//modelos
var User = require('../models/user');
var Animal = require('../models/animal');

//acciones
function pruebas(req, res){
	res.status(200).send({
		message: 'Probando el controlador de animales',
		user: req.user
	});
}

function saveAnimal(req, res){
	var animal = new Animal();

	var params = req.body;

	if(params.name){
		animal.name = params.name;
		animal.description = params.description;
		animal.year = params.year;
		animal.image = null;
		animal.user = req.user.sub;

		animal.save((err, animalStored) => {
			if(err){
				return res.status(500).send({message: 'Error en el servidor'});
			}else{
				if(!animalStored){
					return res.status(404).send({message: 'Error al guardar el animal'});
				}else{
					return res.status(200).send({animal: animalStored});
				}
			}
		});
	}else{
		return res.status(200).send({message: 'El nombre del animal es obligatorio'});
	}
}

function getAnimals(req, res){
	Animal.find({}).populate({path: 'user'}).exec((err, animals) => {
	//Animal.find({}).populate({path:'user', select: 'name surname'}).exec((err, animals)=>{
		if(err){
			return res.status(500).send({message: 'Error en la peticion'});
		}else{
			if(!animals){
				return res.status(404).send({message: 'No hay animales creados'});
			}else{
				return res.status(200).send({animals});
			}
		}
	});	
}

function getAnimal(req, res){
	var animalId = req.params.id;

	Animal.findById(animalId).populate({path: 'user'}).exec((err, animal) => {
		if(err){
			return res.status(500).send({message: 'Error en la peticion'});
		}else{
			if(!animal){
				return res.status(404).send({message: 'El animal no existe'});
			}else{
				return res.status(200).send({animal});
			}
		}	
	});
}

function updateAnimal(req, res){
	var animalId = req.params.id;
	var update =  req.body;

	Animal.findByIdAndUpdate(animalId, update, {new: true},(err, animalUpdated) => {
		if(err){
			return res.status(500).send({message: 'Error en la peticion'});
		}else{
			if(!animalUpdated){
				return res.status(404).send({message: 'No se ha actualizado el animal'});
			}else{
				return res.status(200).send({animal: animalUpdated});
			}
		}
	});
}

function uploadImage(req, res){
	var animalId = req.params.id;
	var file_name = 'No subido...';

	if(req.files){
		var file_path = req.files.image.path;
		var file_split = file_path.split('\\');
		var file_name = file_split[2];

		var ext_split = file_name.split('\.');
		var file_ext = ext_split[1];

		if(file_ext == 'png' || file_ext == 'jpg' || file_ext == 'jpeg' || file_ext == 'gif'){

			Animal.findByIdAndUpdate(animalId, {image: file_name}, {new:true}, (err, animalUpdated) => {
				if(err){
					return res.status(500).send({message: 'Error al actualizar usuario'});
				}else{
					if(!animalUpdated){
						return res.status(404).send({message: 'no se ha actualizado el animal'});
					}else{
						return res.status(200).send({user: animalUpdated, image: file_name});
					}
				}
			});
		}else{
			fs.unlink(file_path, (err) => {
				if(err){
					return res.status(200).send({message: 'extensión no valida y fichero no borrado'});
				}
				else{
					return res.status(200).send({message: 'extensión no valida'});
				}
			})
			
		}
	}else{
		return res.status(200).send({message: 'no se han subido archivos'});
	}
}

function getImageFile(req, res){
	var imageFile = req.params.imageFile;
	var path_File = './uploads/animals/'+imageFile;

	fs.exists(path_File, function(exists){
		if(exists){
			return res.sendFile(path.resolve(path_File));
		}else{
			return res.status(404).send({message: 'La imagen no existe'});
		}
	});
}

function deleteAnimal(req, res){
	var animalId = req.params.id;

	Animal.findByIdAndRemove(animalId, (err, animalRemoved) => {
		if(err){
			return res.status(500).send({message: 'Erro en la peticion'});
		}else{
			if(!animalRemoved){
				return res.status(404).send({message: 'No se ha podiddo borrar el animal'});
			}else{
				return res.status(404).send({animal: animalRemoved});
			}
		}
	});

}

module.exports = {
	pruebas,
	saveAnimal,
	getAnimals,
	getAnimal,
	updateAnimal,
	uploadImage,
	getImageFile,
	deleteAnimal
};