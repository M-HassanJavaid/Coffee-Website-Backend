const express = require('express');
const AnalyticsRouter = express.Router();
const { checkAuth } = require('../middleware/checkAuth.js');
const { checkAdmin } = require('../middleware/checkAdmin.js');
const { Order } = require('../models/order.js');
const { User } = require('../models/user.js');

function getStartOfToday() {
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    return startOfToday;
}

function getStartOfWeek() {
    const now = new Date();
    let dayOfWeek = now.getDay();
    dayOfWeek = dayOfWeek === 0 ? 7 : dayOfWeek; // make Monday=1
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - dayOfWeek + 1);
    startOfWeek.setHours(0, 0, 0, 0);
    return startOfWeek;
}

function getStartOfMonth() {
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);
    return startOfMonth
}

function getStartOfYear() {
    const now = new Date();
    const startOfYear = new Date(now.getFullYear(), 0, 1);
    return startOfYear;

}

AnalyticsRouter.use(checkAuth, checkAdmin);

AnalyticsRouter.get('/overview/orders', async (req, res) => {
    try {
        //Start of today
        const startOfToday = getStartOfToday();

        // Start of Week
        const startOfWeek = getStartOfWeek();

        // Start of Month
        const startOfMonth = getStartOfMonth();

        //Start of Year
        const startOfYear = getStartOfYear();

        const overview = await Order.aggregate([
            {
                $facet: {
                    today: [
                        { $match: { createdAt: { $gte: startOfToday } } },
                        {
                            $group: {
                                _id: null,
                                totalOrders: { $sum: 1 },
                                totalConfirmedOrders: { $sum: { $cond: [{ $eq: ["$orderStatus", "confirmed"] }, 1, 0] } },
                                completedOrders: { $sum: { $cond: [{ $eq: ["$orderStatus", "delivered"] }, 1, 0] } },
                                faliedOrders: { $sum: { $cond: [{ $eq: ["$orderStatus", "pending"] }, 1, 0] } },
                                cancelledOrders: { $sum: { $cond: [{ $eq: ["$orderStatus", "cancelled"] }, 1, 0] } },
                                totalSales: { $sum: { $cond: [{ $eq: ["$orderStatus", "delivered"] }, "$totalAmount", 0] } }
                            }
                        }
                    ],

                    thisWeek: [
                        { $match: { createdAt: { $gte: startOfWeek } } },
                        {
                            $group: {
                                _id: null,
                                totalOrders: { $sum: 1 },
                                totalConfirmedOrders: { $sum: { $cond: [{ $eq: ["$orderStatus", "confirmed"] }, 1, 0] } },
                                completedOrders: { $sum: { $cond: [{ $eq: ["$orderStatus", "delivered"] }, 1, 0] } },
                                faliedOrders: { $sum: { $cond: [{ $eq: ["$orderStatus", "pending"] }, 1, 0] } },
                                cancelledOrders: { $sum: { $cond: [{ $eq: ["$orderStatus", "cancelled"] }, 1, 0] } },
                                totalSales: { $sum: { $cond: [{ $eq: ["$orderStatus", "delivered"] }, "$totalAmount", 0] } }
                            }
                        }
                    ],

                    thisMonth: [
                        { $match: { createdAt: { $gte: startOfMonth } } },
                        {
                            $group: {
                                _id: null,
                                totalOrders: { $sum: 1 },
                                totalConfirmedOrders: { $sum: { $cond: [{ $eq: ["$orderStatus", "confirmed"] }, 1, 0] } },
                                completedOrders: { $sum: { $cond: [{ $eq: ["$orderStatus", "delivered"] }, 1, 0] } },
                                faliedOrders: { $sum: { $cond: [{ $eq: ["$orderStatus", "pending"] }, 1, 0] } },
                                cancelledOrders: { $sum: { $cond: [{ $eq: ["$orderStatus", "cancelled"] }, 1, 0] } },
                                totalSales: { $sum: { $cond: [{ $eq: ["$orderStatus", "delivered"] }, "$totalAmount", 0] } }
                            }
                        }
                    ],

                    thisYear: [
                        { $match: { createdAt: { $gte: startOfYear } } },
                        {
                            $group: {
                                _id: null,
                                totalOrders: { $sum: 1 },
                                totalConfirmedOrders: { $sum: { $cond: [{ $eq: ["$orderStatus", "confirmed"] }, 1, 0] } },
                                completedOrders: { $sum: { $cond: [{ $eq: ["$orderStatus", "delivered"] }, 1, 0] } },
                                faliedOrders: { $sum: { $cond: [{ $eq: ["$orderStatus", "pending"] }, 1, 0] } },
                                cancelledOrders: { $sum: { $cond: [{ $eq: ["$orderStatus", "cancelled"] }, 1, 0] } },
                                totalSales: { $sum: { $cond: [{ $eq: ["$orderStatus", "delivered"] }, "$totalAmount", 0] } }
                            }
                        }
                    ],

                    lifetime: [
                        {
                            $group: {
                                _id: null,
                                totalOrders: { $sum: 1 },
                                totalConfirmedOrders: { $sum: { $cond: [{ $eq: ["$orderStatus", "confirmed"] }, 1, 0] } },
                                completedOrders: { $sum: { $cond: [{ $eq: ["$orderStatus", "delivered"] }, 1, 0] } },
                                faliedOrders: { $sum: { $cond: [{ $eq: ["$orderStatus", "pending"] }, 1, 0] } },
                                cancelledOrders: { $sum: { $cond: [{ $eq: ["$orderStatus", "cancelled"] }, 1, 0] } },
                                totalSales: { $sum: { $cond: [{ $eq: ["$orderStatus", "delivered"] }, "$totalAmount", 0] } }
                            }
                        }
                    ]
                }
            }
        ]);

        let emptySale = {
            _id: null,
            totalOrders: 0,
            totalConfirmedOrders: 0,
            completedOrders: 0,
            faliedOrders: 0,
            cancelledOrders: 0,
            totalSales: 0
        }



        res.status(200).json({
            today: overview[0].today[0] ?? emptySale,
            thisWeek: overview[0].thisWeek[0] ?? emptySale,
            thisMonth: overview[0].thisMonth[0] ?? emptySale,
            thisYear: overview[0].thisYear[0] ?? emptySale,
            lifetime: overview[0].lifetime[0] ?? emptySale,
        })

    } catch (error) {

        res.status(500).json({
            ok: false,
            message: error.message
        })

    }
});

AnalyticsRouter.get('/overview/users', async (req, res) => {
    try {
        const startOfToday = getStartOfToday();
        const startOfWeek = getStartOfWeek();
        const startOfMonth = getStartOfMonth();
        const startOfYear = getStartOfYear();

        console.log(startOfMonth)

        async function getNewUsers(startDate) {
            const result = await User.aggregate([
                { $match: { createdAt: { $gte: startDate } } },
                {
                    $group: {
                        _id: null,
                        totalUser: { $sum: 1 },
                        verifiedUsers: { $sum: { $cond: [{ $eq: ["$isVerified", true] }, 1, 0] } },
                        unVerifiedUsers: { $sum: { $cond: [{ $eq: ["$isVerified", false] }, 1, 0] } }
                    }
                }
            ]);
            return result[0] ?? { totalUser: 0, verifiedUsers: 0, unVerifiedUsers: 0 };
        }

        async function getActiveUsers(startDate) {
            let result = await Order.distinct("user", {
                createdAt: { $gte: startDate }
            });
            return result.length; // returns number
        }

        const totalUsersCount = await User.aggregate([
            {
                $group: {
                    _id: null,
                    totalUsers: { $sum: 1 },
                    verifiedUsers: { $sum: { $cond: [{ $eq: ["$isVerified", true] }, 1, 0] } },
                    unVerifiedUsers: { $sum: { $cond: [{ $eq: ["$isVerified", false] }, 1, 0] } }
                }
            }
        ]);

        const total = totalUsersCount[0] ?? {
            totalUsers: 0,
            verifiedUsers: 0,
            unVerifiedUsers: 0
        };

        const todayNewUser = await getNewUsers(startOfToday);
        const thisWeekNewUser = await getNewUsers(startOfWeek);
        const thisMonthNewUser = await getNewUsers(startOfMonth);
        const thisYearNewUser = await getNewUsers(startOfYear);

        const todayActiveUser = await getActiveUsers(startOfToday);
        const thisWeekActiveUser = await getActiveUsers(startOfWeek);
        const thisMonthActiveUser = await getActiveUsers(startOfMonth);
        const thisYearActiveUser = await getActiveUsers(startOfYear);

        res.status(200).json({
            total,
            newUsers: {
                today: todayNewUser,
                thisWeek: thisWeekNewUser,
                thisMonth: thisMonthNewUser,
                thisYear: thisYearNewUser
            },
            activeUsers: {
                today: todayActiveUser,
                thisWeek: thisWeekActiveUser,
                thisMonth: thisMonthActiveUser,
                thisYear: thisYearActiveUser
            }
        });

    } catch (error) {
        res.status(500).json({
            ok: false,
            message: error.message
        });
    }
});



AnalyticsRouter.get('/last_thirteen_month_sales', async (req, res) => {
    try {

        const monthNames = [
            "January", "February", "March", "April", "May", "June",
            "July", "August", "September", "October", "November", "December"
        ];

        let thirteenMonthsAgo = new Date();
        thirteenMonthsAgo.setMonth(thirteenMonthsAgo.getMonth() - 12); // 13 months ago
        thirteenMonthsAgo.setDate(1);
        thirteenMonthsAgo.setHours(0, 0, 0, 0);


        let allSales = await Order.find({
            createdAt: { $gte: thirteenMonthsAgo },
            orderStatus: 'delivered'
        }).populate([
            {
                path: "user",
                select: '-password'
            },
            {
                path: "items.product"
            }
        ]);

        console.log('month ==> ' + thirteenMonthsAgo.getMonth());
        console.log('year ==> ' + thirteenMonthsAgo.getFullYear());

        let anylaticsMonth = [];

        for (let i = 0; i < 13; i++) {
            thirteenMonthsAgo.setMonth(thirteenMonthsAgo.getMonth() + 1);

            let thisMonthSales = allSales.filter((order) => {
                let orderDate = new Date(order.createdAt);

                if (
                    (orderDate.getMonth() === thirteenMonthsAgo.getMonth()) &&
                    (orderDate.getFullYear() === thirteenMonthsAgo.getFullYear())
                ) {
                    return true
                } else {
                    return false
                }

            })

            anylaticsMonth.push({
                month: monthNames[thirteenMonthsAgo.getMonth()],
                year: thirteenMonthsAgo.getFullYear(),
                sales: thisMonthSales.length,
                orders: thisMonthSales ?? []
            })

        }

        res.json(anylaticsMonth)

        console.log(anylaticsMonth.length)

    } catch (error) {

        res.send(error.message)
    }
})


module.exports = { AnalyticsRouter }