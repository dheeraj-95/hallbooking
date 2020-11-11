const bodyParser = require('body-parser'); // Require body-parser to parse the request to json
const express = require('express'); // express required to start a server
const app = express(); // Get instance of express app calling it.

var Validator = require('jsonschema').Validator;
var myValidator = new Validator();

const { roomSchema, bookRoomSchema } = require('./Schema/schemas');
const isIsoDate = require('./Helpers/helper');

const roomsData = [];

let port = process.env.PORT || 8080;

const custBookings = []
let rooms = [];

app
    .use(bodyParser.json())

    .post('/api/createRoom', (request, response) => {

        let rooms = JSON.parse(JSON.stringify(request.body));
        const isRoomValid = myValidator.validate(rooms, roomSchema, { required: true }).valid;
        
        if (rooms !== undefined && isRoomValid) {

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
                roomId: request.body.roomId,
                startDate: request.body.startDate,
                endDate: request.body.endDate,
                currentDate: new Date().toString(),
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
    .get('/listAllRooms', (request, response) => {
        response.status(200).json({
            data: roomsData,
        })
    })
    .get('/allCustomers', (request, response) => {

    })
    .get('/*', (request, response) => {
        response.status(404).send('<h1>Page Not Found ! </h1>');
    })
    .listen(port, console.log(`Booking App listening at port ${port}`));