const bodyParser = require('body-parser'); // Require body-parser to parse the request to json
const express = require('express'); // express required to start a server
const app = express(); // Get instance of express app calling it.

var Validator = require('jsonschema').Validator;
var myValidator = new Validator();

const { roomSchema, bookRoomSchema } = require('./Schema/schemas');
const isIsoDate = require('./Helpers/helper');

const roomsData = [];

let port = process.env.PORT || 8080;

const custBookings = [];

app
    .use(bodyParser.json())

    .post('/api/createRoom', (request, response) => {

        let room = JSON.parse(JSON.stringify(request.body));
        const isRoomValid = myValidator.validate(room, roomSchema, { required: true }).valid;
        
        if (room !== undefined && isRoomValid) {

            const newRoom = {
                roomId: roomsData.length + 1,
                roomName: request.body.roomName,
                amenities: request.body.amenities,
                noOfSeats: request.body.noOfSeats,
                priceForHour: request.body.priceForHour,
            };
            roomsData.push(newRoom);
            response.status(201).json({ status: "Room Details Created Successfully.!" });
        } else {
            response.status(400).json({ status: "Creating Room Failed.! Please check the details Again" });
        }
    })
    .post('/api/bookRoom', (request, response) => {
        
        const isBookRoomValid = myValidator.validate(JSON.parse(JSON.stringify(request.body)), bookRoomSchema, { required: true }).valid;

        const bookingExists = custBookings.find((booking) =>
            (((request.body.startDate <= booking.startDate && (request.body.endDate >= booking.startDate && request.body.endDate <= booking.endDate))
                || (request.body.endDate >= booking.startDate && request.body.endDate <= booking.endDate)))
            && booking.roomId == request.body.roomId);
        
        if (bookingExists) return response.status(422).json({ message: "Sorry, Requested Room not Available in this time range" });

        if (!isBookRoomValid) return response.status(400).json({ message: `Sorry. Room Booking Failed.!` })
        
        if ((isIsoDate(request.body.startDate) && isIsoDate(request.body.endDate)) && (!bookingExists)) {

            const newBookRoom = {
                customerId: `${request.body.customerName + '-' + (custBookings.length + 1)}`,
                customerName: request.body.customerName,
                Date: new Date().toString(),
                startDate: request.body.startDate,
                endDate: request.body.endDate,
                roomId: request.body.roomId,
            };
            custBookings.push(newBookRoom);
            
            response.status(201).json({
                message: `Booking Created Successfully`
            })
        }
        else {
            response.status(400).json({
                message: `Please Provide a valid ISO Date!`
            })
        }

    })
    .get('/api/listAllRooms', (request, response) => {
        const allRoomsData = [];
        custBookings.forEach((booking) => {
            let listARoom = {
                roomName : roomsData.find(room => room.roomId === booking.roomId).roomName,
                bookingStatus : "Successful",
                customerName : booking.customerName,
                Date : booking.Date,
                startDate : booking.startDate,
                endDate : booking.endDate,
            }
            allRoomsData.push(listARoom);
        });
        response.status(200).send(allRoomsData);
    })
    .get('/api/listAllCustomers', (request, response) => {
        const allCustomers = [];
        custBookings.forEach((booking) => {
            let listaCustomer = {
                customerName : booking.customerName,
                roomName : roomsData.find(room => room.roomId === booking.roomId).roomName,
                Date : booking.Date,
                startDate : booking.startDate,
                endDate : booking.endDate,
            }
            allCustomers.push(listaCustomer);
        });
        response.status(200).send(allCustomers);
    })
    .get('/*', (request, response) => {
        response.status(404).send('<h1>Page Not Found ! </h1>');
    })
    .listen(port, console.log(`Booking App listening at port ${port}`));