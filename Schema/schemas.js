const roomSchema = {
    id: "/roomSchema",
    type: "object",
    properties: {
        roomId: { type: "number" },
        roomName: { type: "string" },
        noOfSeats: { type: "number" },
        amenities: {
            type: "array",
            items: { type: "string" }
        },
        priceForHour: { type: "number" },
    },

    required: ["roomName", "noOfSeats", "amenities", "priceForHour"]
}

const bookRoomSchema = {
    type: "object",
    properties : {
        customerName : { type: "string" },
        customerId : { type: "string" },
        startDate : { type: "string" },
        endDate : { type: "string" },
        roomId : {type : "number"},
    },
    required: ["startDate", "endDate", "roomId", "customerName"],

};
module.exports = {roomSchema, bookRoomSchema};