const express = require('express');
const AnalyticsRouter = express.Router();
const { checkAuth } = require('../middleware/checkAuth.js');
const { checkAdmin } = require('../middleware/checkAdmin.js');
const { Order } = require('../models/order.js');
const { User } = require('../models/user.js');
const { findGrowth } = require('../utility_Function/findGrowth.js');
const { Product } = require('../models/product.js');
const mongoose = require('mongoose');
const getLastNintyDays = require('../utility_Function/getLastNintyDays.js');
const getLastSevenDays = require('../utility_Function/getLastSevenDays.js');
const getLastThirtyDays = require('../utility_Function/getLastThirtyDays.js');

const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
];



// AnalyticsRouter.use(checkAuth, checkAdmin);

AnalyticsRouter.get('/overview/:range', async (req, res) => {

    try {

        let allowRange = ['today', 'this_week', 'this_month', 'this_year', 'lifetime']

        let ActualRangeDate = new Date();
        let previousRangeDate = new Date()
        let { range } = req.params;

        if (!allowRange.includes(range)) {
            return res.status(401).json({
                ok: false,
                message: 'Invalid range!'
            })
        }

        if (range === 'lifetime') {

            let totalUsers = await User.countDocuments({ isVerified: true });
            let activeUsers = await Order.distinct('user');
            let orders = await Order.aggregate([
                { $match: { orderStatus: 'delivered' } },
                {
                    $group: {
                        _id: null,
                        totalOrders: { $sum: 1 },
                        sales: { $sum: "$totalAmount" }
                    }
                }
            ])


            let response = {
                totalUsers,
                newUsers: null,
                newUsersGrowth: null,
                activeUsers: activeUsers.length,
                activeUsersGrowth: null,
                orders: orders[0].totalOrders,
                ordersGrowth: null,
                sales: orders[0].sales,
                salesGrowth: null,
                averageOrderValue: orders[0].sales / orders[0].totalOrders
            };

            return res.json(response)
        }

        ActualRangeDate.setHours(0, 0, 0, 0);
        previousRangeDate.setHours(0, 0, 0, 0);

        if (range === 'today') {
            previousRangeDate.setDate(previousRangeDate.getDate() - 1)
        } else if (range === 'this_week') {
            const day = ActualRangeDate.getDay(); // 0–6
            const diff = day === 0 ? -6 : 1 - day;

            // Start of this week (Monday)
            ActualRangeDate.setDate(ActualRangeDate.getDate() + diff);

            // Start of last week
            previousRangeDate = new Date(ActualRangeDate);
            previousRangeDate.setDate(previousRangeDate.getDate() - 7);

        } else if (range === 'this_month') {
            ActualRangeDate.setDate(1);

            previousRangeDate.setDate(1);
            previousRangeDate.setMonth(previousRangeDate.getMonth() - 1)
        } else if (range === 'this_year') {
            ActualRangeDate.setMonth(0);
            ActualRangeDate.setDate(1);

            previousRangeDate.setMonth(0);
            previousRangeDate.setDate(1);
            previousRangeDate.setFullYear(previousRangeDate.getFullYear() - 1)
        }


        let totalUsers = await User.aggregate([
            {
                $group: {
                    _id: null,
                    totalUsers: { $sum: 1 },
                    currentNewUsers: {
                        $sum: {
                            $cond: [
                                {
                                    $and: [
                                        { $gte: ["$createdAt", ActualRangeDate] },
                                        { $eq: ["$isVerified", true] }
                                    ]
                                }, 1, 0
                            ]
                        }
                    },
                    previousNewUser: {
                        $sum: {
                            $cond: [
                                {
                                    $and: [
                                        { $gte: ["$createdAt", previousRangeDate] },
                                        { $lt: ["$createdAt", ActualRangeDate] },
                                        { $eq: ["$isVerified", true] }
                                    ]
                                }, 1, 0
                            ]
                        }
                    }
                }
            }
        ]);

        let currentNewUsers = +totalUsers[0].currentNewUsers;
        let previousNewUsers = +totalUsers[0].previousNewUser;

        let currentActiveUsers = await Order.distinct("user", {
            createdAt: { $gte: ActualRangeDate }
        });

        let previousActiveUsers = await Order.distinct("user", {
            createdAt: {
                $gte: previousRangeDate,
                $lt: ActualRangeDate
            }
        });


        let orders = await Order.aggregate([
            {
                $group: {
                    _id: null,
                    CurrentTotalOrders: {
                        $sum: {
                            $cond: [
                                {
                                    $and: [
                                        { $eq: ["$orderStatus", "delivered"] },
                                        { $gte: ["$createdAt", ActualRangeDate] },
                                    ]
                                }, 1, 0
                            ]
                        }
                    },
                    previousTotalOrders: {
                        $sum: {
                            $cond: [
                                {
                                    $and: [
                                        { $eq: ["$orderStatus", "delivered"] },
                                        { $lt: ["$createdAt", ActualRangeDate] },
                                        { $gte: ["$createdAt", previousRangeDate] }
                                    ]
                                }, 1, 0
                            ]
                        }
                    },
                    currentTotalSales: {
                        $sum: {
                            $cond: [
                                {
                                    $and: [
                                        { $eq: ["$orderStatus", "delivered"] },
                                        { $gte: ["$createdAt", ActualRangeDate] },
                                    ]
                                }, "$totalAmount", 0
                            ]
                        }
                    },
                    previousTotalSales: {
                        $sum: {
                            $cond: [
                                {
                                    $and: [
                                        { $eq: ["$orderStatus", "delivered"] },
                                        { $lt: ["$createdAt", ActualRangeDate] },
                                        { $gte: ["$createdAt", previousRangeDate] }
                                    ]
                                }, "$totalAmount", 0
                            ]
                        }
                    },
                }
            }
        ]);

        let currentTotalOrders = orders[0]?.CurrentTotalOrders || 0;
        let previousTotalOrders = orders[0]?.previousTotalOrders || 0;
        let currentTotalSales = orders[0]?.currentTotalSales || 0;
        let previousTotalSales = orders[0]?.previousTotalSales || 0;


        let response = {
            totalUsers: totalUsers[0]?.totalUsers,
            newUsers: currentNewUsers,
            newUsersGrowth: findGrowth(currentNewUsers, previousNewUsers),
            activeUsers: currentActiveUsers.length,
            activeUsersGrowth: findGrowth(currentActiveUsers.length, previousActiveUsers.length),
            orders: currentTotalOrders,
            ordersGrowth: findGrowth(currentTotalOrders, previousTotalOrders),
            sales: currentTotalSales,
            salesGrowth: findGrowth(currentTotalSales, previousTotalSales),
            averageOrderValue: (currentTotalSales / currentTotalOrders) || 0
        };

        console.log(currentTotalSales / currentTotalOrders)

        res.status(200).json(response)


    } catch (error) {

        res.status(500).json({ ok: false, message: error.message })

    }

});

AnalyticsRouter.get('/sales_for_graph', async (req, res) => {
    try {

        let last_90_days = getLastNintyDays();

        let orders = await Order.find({
            orderStatus: 'delivered',
            createdAt: { $gte: last_90_days }
        }).sort({ createdAt: 1 });

        let dataSkeleton = [];
        for (let i = 0; i < 90; i++) {
            last_90_days.setDate(last_90_days.getDate() + 1)

            dataSkeleton.push({
                sales: 0,
                orders: 0,
                date: `${last_90_days.getFullYear()}-${last_90_days.getMonth() + 1}-${last_90_days.getDate()}`
            });
        }



        for (let i = 0; i < orders.length; i++) {

            let currentOrderDate = new Date(orders[i].createdAt);


            for (let j = 0; j < dataSkeleton.length; j++) {

                if (dataSkeleton[j].date === `${currentOrderDate.getFullYear()}-${currentOrderDate.getMonth() + 1}-${currentOrderDate.getDate()}`) {
                    dataSkeleton[j].sales += orders[i].totalAmount;
                    dataSkeleton[j].orders++;
                    break;
                }

            }

        }

        res.status(200).json(dataSkeleton)

    } catch (error) {
        res.status(500).json({
            ok: false,
            message: error.message
        })
    }
});

AnalyticsRouter.get('/product/:id', async (req, res) => {
    try {
        
        let last_7_days = getLastSevenDays();
        let last_30_days = getLastThirtyDays();
        let last_90_days = getLastNintyDays();
    
        let rawAnalytics = await Order.aggregate([

            { $unwind: "$items" },

            {
                $match: {
                    "items.product": new mongoose.Types.ObjectId(req.params.id),
                    orderStatus: "delivered"
                }
            },

            // 3️⃣ Group & calculate units + revenue
            {
                $group: {
                    _id: req.params.id,

                    last_7_days_UnitsSold: {
                        $sum: {
                            $cond: [
                                { $gte: ["$createdAt", last_7_days] },
                                "$items.quantity",
                                0
                            ]
                        }
                    },

                    last_30_days_UnitsSold: {
                        $sum: {
                            $cond: [
                                { $gte: ["$createdAt", last_30_days] },
                                "$items.quantity",
                                0
                            ]
                        }
                    },

                    last_90_days_UnitsSold: {
                        $sum: {
                            $cond: [
                                { $gte: ["$createdAt", last_90_days] },
                                "$items.quantity",
                                0
                            ]
                        }
                    },

                    lifetime_unitsSold : {
                        $sum : "$items.quantity"
                    },

                    // ✅ REVENUE
                    last_7_days_revenue: {
                        $sum: {
                            $cond: [
                                { $gte: ["$createdAt", last_7_days] },
                                "$items.price.total",
                                0
                            ]
                        }
                    },

                    last_30_days_revenue: {
                        $sum: {
                            $cond: [
                                { $gte: ["$createdAt", last_30_days] },
                                "$items.price.total",
                                0
                            ]
                        }
                    },

                    last_90_days_revenue: {
                        $sum: {
                            $cond: [
                                { $gte: ["$createdAt", last_90_days] },
                                "$items.price.total",
                                0
                            ]
                        }
                    },

                    lifetime_revenue: {
                        $sum : "$items.price.total"
                    }
                }
            }
        ]);

        // return res.json(rawAnalytics)

        rawAnalytics = rawAnalytics[0];

        let productAnaylatics = {

            totalUnitsSold: {
                last_7_days: rawAnalytics?.last_7_days_UnitsSold || 0,
                last_30_days: rawAnalytics?.last_30_days_UnitsSold || 0,
                last_90_days: rawAnalytics?.last_90_days_UnitsSold || 0,
                lifetime: rawAnalytics?.lifetime_unitsSold || 0
            },

            totalRevenue: {
                last_7_days: rawAnalytics?.last_7_days_revenue || 0,
                last_30_days: rawAnalytics?.last_30_days_revenue || 0,
                last_90_days: rawAnalytics?.last_90_days_revenue || 0,
                lifetime: rawAnalytics?.lifetime_revenue || 0
            }

        }

        return res.json(productAnaylatics)


    } catch (error) {
        res.status(500).json({
            ok: false,
            message: error.message
        })
    }
})




module.exports = { AnalyticsRouter }