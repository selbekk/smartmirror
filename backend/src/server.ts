import errorHandler from 'errorhandler';
import app from './app';

/** This file starts the server itself. Go to ./app.ts for more details */

app.use(errorHandler());

app.listen(app.get('port'), () => {
  console.log(
    `🎉 API is now running on port ${app.get('port')} in ${app.get(
      'env',
    )} mode.`,
  );
});
