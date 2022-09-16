/* if we are in test environment, flush db and make new migrations */
/* now we have two methods of running migrations: either $ sequelize db:migrate
   or setting NODE_ENV to test and allowing this script run migrations for us */
import Sequelize from 'sequelize';
import { sequelize } from '../models/index.js';
import { Umzug, SequelizeStorage } from 'umzug';
import env from 'dotenv';
env.config();

export const migrate = async (req, res) => {
    const environment = process.env.NODE_ENV || 'development';
    if (environment == 'test') {
        try {
            const umzug = new Umzug({
                migrations: {
                    glob: ['*.cjs', 'seeders/*.{ts, js, cjs}'],
                    // sometimes it's necessary to modify the parameters umzug will
                    // pass to your migration methods when the library calls the up
                    // and down methods for each migration. This is the case when
                    // using migrations currently generated using sequilize-cli
                    // in this case you can use the resolve fuction during migration
                    // configuration to determine which parameters will be passed
                    // to the relevant method
                    resolve: ({ name, path, context }) => {
                        const migration = import(path)
                        return {
                            // adjust the parameters Umzug will
                            // pass to migration methods when called
                            name,
                            up: async () => {
                                const m = await migration
                                return m.up(context, Sequelize)
                            },
                            down: async () => {
                                const m = await migration
                                return m.default.down(context, Sequelize)
                            },
                        }
                    },
                },
                context: sequelize.getQueryInterface(),
                storage: new SequelizeStorage({ sequelize }),
                logger: console
            });

            // execute all migrations; we'll flush db first with down()
            await umzug.down({ to: 0 });
            await umzug.up();
            res.status(200).json({
                message: `Migration successful in ${environment} environment`
            });
        } catch (error) {
            console.error(error)
            res.status(400).json({
                message: `Migration failed: ${error.message}`
            });
        }
    } else {
        res.status(400).json({ message: "Not in test environment" });
    }
}
