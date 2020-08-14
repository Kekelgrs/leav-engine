import React from 'react';
import {useTranslation} from 'react-i18next';

function Home(): JSX.Element {
    const {t} = useTranslation();

    return (
        <div>
            <h1>{t('home.title')}</h1>
        </div>
    );
}

export default Home;
