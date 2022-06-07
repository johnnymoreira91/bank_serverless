const jwt = require('jsonwebtoken');

const authorizeUser = (userScopes, methodArn) => {
  const hasValidScope = methodArn.endsWith(userScopes);
  return hasValidScope;
};

/**
 * @function
 * @type {import('aws-lambda').APIGatewayEvent}
 */
exports.handler = function (event, context, callback) {
  // var token = event.authorizationToken;
  try {
    const token = event.authorizationToken.replace('Bearer ', '')
    const decoded = jwt.verify(token, process.env.SECRET);
    const user = decoded;

    const isAllowed = authorizeUser(event.resource, event.methodArn);
    const effect = isAllowed ? 'Allow' : 'Deny';
    const userId = user.login;
    const authorizerContext = { user: JSON.stringify(user) }
    const policyDocument = generatePolicy(userId, effect, event.methodArn, authorizerContext);
    callback(null, policyDocument);
  } catch (error) {
    console.error('error authorizer', error)
    callback('Unauthorized!'); // Return a 401 Unauthorized response
  }
};

// Help function to generate an IAM policy
var generatePolicy = function (principalId, effect, resource) {
  var authResponse = {};
  
  authResponse.principalId = principalId;
  if (effect && resource) {
    var policyDocument = {};
    policyDocument.Version = '2012-10-17';
    policyDocument.Statement = [];
    var statementOne = {};
    statementOne.Action = 'execute-api:Invoke';
    statementOne.Effect = effect;
    statementOne.Resource = resource;
    policyDocument.Statement[0] = statementOne;
    authResponse.policyDocument = policyDocument;
  }

  // Optional output with custom properties of the String, Number or Boolean type.
  authResponse.context = {
    "stringKey": "stringval",
    "numberKey": 123,
    "booleanKey": true
  };
  return authResponse;
}
