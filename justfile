set dotenv-load

@dev package *flags='':
    cd packages/{{package}} && npm run dev -- {{flags}}

@test package *args:
    cd packages/{{package}} && npm run test -- {{args}}
