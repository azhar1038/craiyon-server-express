# Craiyon Server: From words to wonders

API for generating images from text using different AI image generators.
Currently only OpenAI DALLE has been implemented. I have plans to add more services later.

## Table of Contents

- [Technologies Used](#technologies-used)
- [Libraries Used](#libraries-used)
- [API Structure](#api-structure)
  - [`/auth`](#auth)
    - [post `/auth/register`](#post-authregister)
    - [post `/auth/login`](#post-authlogin)
    - [post `/auth/refresh-token`](#post-authrefresh-token)
  - [`/user`](#user)
    - [get `/user/`](#get-user)
    - [patch `/user/new-verificaion-token`](#patch-usernew-verificaion-token)
    - [get `/user/verify/:user/:token`](#get-userverifyusertoken)
    - [post `/user/password-reset-mail`](#post-userpassword-reset-mail)
    - [patch `/user/reset-password`](#patch-userreset-password)
    - [get `/user/generated-images`](#get-usergenerated-images)
  - [`/image`](#image)
    - [get `/image/public`](#get-imagepublic)
    - [get `/image/get/:id`](#get-imagegetid)
    - [post `/image/generate`](#post-imagegenerate)
    - [patch `/image/favorite/:id`](#patch-imagefavoriteid)
- [Future plans](#future-plans)

## Technologies Used

- NodeJS
- Express
- MySQL
- Docker
- Typescript

## Libraries Used

- bcrypt
- cors
- dotenv
- dotenv-cli
- eslint
- express
- husky
- jsonwebtoken
- lint-staged
- nodemailer
- openai
- prettier
- prisma
- tsx
- typescript
- vitest
- vitest-mock-extended
- winston

## API Structure

Currently there are three main endpoints:

### `/auth`

#### post `/auth/register`

Used to register a new and send a user verification mail  
**Verification**: Not required  
**Input**:

- email
- name
- password

**Output**: access and refresh token

#### post `/auth/login`

Used to login an existing user  
**Verification**: Not required  
**Input**:

- email
- password

**Output**: access and refresh token

#### post `/auth/refresh-token`

Used to get new tokens using a valid refresh token  
**Verification**: Required  
Bearer token sent via headers as `Bearer <token>`. This should be a valid refresh token  
**Input**: _\<none\>_

**Output**: access and refresh token

### `/user`

#### get `/user/`

Used to get current user details
**Verification**: Required  
Access token sent via headers as `Bearer <token>`  
**Input**: _\<none\>_

**Output**: User details

#### patch `/user/new-verificaion-token`

Used to generate a new account verification token and sends it to registered email.  
**Verification**: Required  
Access token sent via headers as `Bearer <token>`  
**Input**:

- handleUrl: Url that will handle the verification. Preferably a frontend route. By default server url will be used

**Output**: Success or Error response

#### get `/user/verify/:user/:token`

Used to verify the account for token generated using previous API.  
**Verification**: Not required  
**Input**:

- user: User ID
- token: token generated using `/user/new-verificaion-token`

**Output**: Success or Error response

#### post `/user/password-reset-mail`

Used to send password reset mail to registered email  
**Verification**: Not required  
**Input**:

- email

**Output**: Success or Error response

#### patch `/user/reset-password`

Used to reset user password
**Verification**: Not required  
**Input**:

- user: User ID
- token: tokenn generated using `/user/password-reset-mail`
- newPassword

**Output**: Success or Error response

#### get `/user/generated-images`

Used to get all images generated by current user  
**Verification**: Required  
Access token sent via headers as `Bearer <token>`  
**Input**:

- limit: how many images to get
- page: which page (for pagination)

**Output**: List of images

### `/image`

#### get `/image/public`

Used to fetch all public images  
**Verification**: Optional  
If access token is provided, the `likedByUser` images will be `true` for images favoritd by user  
**Input**:

- limit: for pagination
- page: for pagination
- sort: sort by likes (`like`) or created date (`created`)
- order: `asc` or `desc`

**Output**: List of public images

#### get `/image/get/:id`

Used to fetch a particular image based on ID  
**Verification**: Optional  
If access token is not provided, users private image will not be returned.
**Input**:

- id: Image ID

**Output**: Image or Error

#### post `/image/generate`

Used to generate image using different models.  
**Verification**: Required  
Account must be verified  
**Input**:

- prompt: Text used to generate image
- model: `DALLE`
- resolution: `256x256` or `512x512` or `1024x1024`

**Output**: Id of generated image

#### patch `/image/favorite/:id`

Used to add or remove image from user's favorite list  
**Verification**: Required  
**Input**:

- id: Image ID

**Output**: Success or error response

## Future plans

- [] Fix sendPasswordResetMail to use email instead of user id
- [] Fix image favorite to use body instead of params
- [] Add patch route for account verification
- [] Add route to make image private
- [] Add route to delete self generated image
- [] Add more image generating services
- [] Add full docker support
- [] Add "How to run locally" guide for both with and without docker
