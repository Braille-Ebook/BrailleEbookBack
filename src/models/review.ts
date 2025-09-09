import { DataTypes, Model } from 'sequelize';
import sequelize from '../sequelize';

class Review extends Model {}

Review.init(
    {
        review_id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        user_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        book_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        like_count: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
        },
        created_at: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
        },
        content: {
            type: DataTypes.STRING(500),
            allowNull: false,
        },
    },
    {
        sequelize,
        modelName: 'Review',
        tableName: 'Review',
        timestamps: false,
    }
);

export default Review;
