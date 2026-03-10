import { Sequelize, FindOptions } from 'sequelize';

export function bookmarkInclude(userId?: number): FindOptions {
    return {
        attributes: {
            include: [
                [
                    Sequelize.literal(`
                        IF(
                            EXISTS (
                                SELECT 1
                                FROM UserBookBookmark ub
                                WHERE ub.book_id = \`Book\`.\`book_id\`
                                AND ub.user_id = ${userId ?? 0}
                            ),
                            'true',
                            'false'
                        )
                    `),
                    'isBookmarked',
                ],
            ],
        },
    };
}
