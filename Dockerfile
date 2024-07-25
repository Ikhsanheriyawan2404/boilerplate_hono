# use the official Bun image
FROM oven/bun:1 as base
WORKDIR /usr/src/app

# install dependencies into temp directory
FROM base AS install
RUN mkdir -p /temp/dev
COPY package.json bun.lockb /temp/dev/
RUN cd /temp/dev && bun install --frozen-lockfile

# install with --production (exclude devDependencies)
RUN mkdir -p /temp/prod
COPY package.json bun.lockb /temp/prod/
RUN cd /temp/prod && bun install --frozen-lockfile --production

# copy node_modules from temp directory
FROM base AS prerelease
COPY --from=install /temp/dev/node_modules node_modules
COPY . .

# create necessary directories and set permissions
RUN mkdir -p /usr/src/app/logs && chmod -R 777 /usr/src/app/logs

# [optional] tests & build
ENV NODE_ENV=production
RUN bun test
# RUN bun run build

# run Prisma generate and migrate for production
# RUN bunx prisma generate

# copy production dependencies and source code into final image
FROM base AS release
COPY --from=install /temp/prod/node_modules node_modules
COPY --from=prerelease /usr/src/app /usr/src/app

# change the owner of the app directory to the 'bun' user
RUN chown -R bun:bun /usr/src/app

# run the app
USER bun
EXPOSE 3000/tcp
ENTRYPOINT [ "bun", "run", "src/index.ts" ]
