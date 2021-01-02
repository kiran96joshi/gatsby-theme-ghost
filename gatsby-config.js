const _ = require(`lodash`)
const path = require(`path`)

const siteConfigDefaults = require(`./src/utils/siteConfigDefaults`)
const mediaConfigDefaults = require(`./src/utils/mediaConfigDefaults`)
const ghostConfigDefaults = require(`./src/utils/.ghost.json`)

const generateRSSFeed = require(`./src/utils/rss/generate-feed`)

/**
* This is the place where you can tell Gatsby which plugins to use
* and set them up the way you want.
*
* Further info 👉🏼 https://www.gatsbyjs.org/docs/gatsby-config/
*
*/
module.exports = (themeOptions) => {
    const siteConfig = _.merge({}, siteConfigDefaults, themeOptions.siteConfig)
    const mediaConfig = _.merge({}, mediaConfigDefaults, themeOptions.mediaConfig)
    const ghostConfig = _.merge({}, ghostConfigDefaults, themeOptions.ghostConfig)

    return {
        siteMetadata: siteConfig,
        plugins: [
            /**
             *  Content Plugins
             */
            {
                resolve: `gatsby-source-filesystem`,
                options: {
                    path: path.join(__dirname, `src`, `pages`),
                    name: `pages`,
                },
            },
            // Setup for optimized images.
            // See https://www.gatsbyjs.org/packages/gatsby-image/
            {
                resolve: `gatsby-source-filesystem`,
                options: {
                    path: path.join(__dirname, `src`, `images`),
                    name: `images`,
                },
            },
            `gatsby-plugin-sharp`,
            {
                resolve: `gatsby-transformer-sharp`,
                options: {
                    checkSupportedExtensions: false,
                },
            },
            {
                resolve: `gatsby-source-try-ghost`,
                options: {
                    ghostConfig: process.env.NODE_ENV === `development`
                        ? ghostConfig.development
                        : ghostConfig.production,
                    cacheResponse: true,
                    verbose: siteConfig.verbose,
                    severity: siteConfig.severity,
                },
            },
            {
                resolve: `gatsby-plugin-ghost-images`,
                options: {
                    lookup: [
                        {
                            type: `GhostAuthor`,
                            imgTags: [`cover_image`, `profile_image`],
                        },
                        {
                            type: `GhostTag`,
                            imgTags: [`feature_image`],
                        },
                        {
                            type: `GhostPost`,
                            imgTags: [`feature_image`],
                        },
                        {
                            type: `GhostPage`,
                            imgTags: [`feature_image`],
                        },
                        {
                            type: `GhostSettings`,
                            imgTags: [`logo`, `icon`, `cover_image`],
                        },
                    ],
                    exclude: node => (
                        node.ghostId === undefined
                    ),
                    verbose: siteConfig.verbose,
                    // Option to disable this module (default: false)
                    disable: !mediaConfig.gatsbyImages,
                },
            },
            /**
             *  Utility Plugins
             */
            {
                resolve: require.resolve(`./plugins/gatsby-plugin-ghost-manifest`),
                options: {
                    short_name: siteConfig.shortTitle,
                    start_url: `/`,
                    background_color: siteConfig.backgroundColor,
                    theme_color: siteConfig.themeColor,
                    display: `minimal-ui`,
                    icon: `static/${siteConfig.siteIcon}`,
                    legacy: true,
                    query: `
                    {
                        allGhostSettings {
                            edges {
                                node {
                                    title
                                    description
                                }
                            }
                        }
                    }
                  `,
                },
            },
            {
                resolve: `gatsby-plugin-feed`,
                options: {
                    query: `
                    {
                        allGhostSettings {
                            edges {
                                node {
                                    title
                                    description
                                    url
                                }
                            }
                        }
                    }
                  `,
                    feeds: [
                        generateRSSFeed(siteConfig),
                    ],
                },
            },
            {
                resolve: `gatsby-plugin-advanced-sitemap`,
                options: {
                    query: `
                    {
                        allGhostPost {
                            edges {
                                node {
                                    id
                                    slug
                                    updated_at
                                    created_at
                                    feature_image
                                }
                            }
                        }
                        allGhostPage {
                            edges {
                                node {
                                    id
                                    slug
                                    updated_at
                                    created_at
                                    feature_image
                                }
                            }
                        }
                        allGhostTag {
                            edges {
                                node {
                                    id
                                    slug
                                    feature_image
                                }
                            }
                        }
                        allGhostAuthor {
                            edges {
                                node {
                                    id
                                    slug
                                    profile_image
                                }
                            }
                        }
                    }`,
                    mapping: {
                        allGhostPost: {
                            sitemap: `posts`,
                        },
                        allGhostTag: {
                            sitemap: `tags`,
                        },
                        allGhostAuthor: {
                            sitemap: `authors`,
                        },
                        allGhostPage: {
                            sitemap: `pages`,
                        },
                    },
                    exclude: [
                        `/dev-404-page`,
                        `/404`,
                        `/404.html`,
                        `/offline-plugin-app-shell-fallback`,
                    ],
                    createLinkInHead: true,
                    addUncaughtPages: true,
                },
            },
            `gatsby-plugin-catch-links`,
            `gatsby-plugin-react-helmet`,
            `gatsby-plugin-force-trailing-slashes`,
            {
                resolve: `gatsby-plugin-postcss`,
                options: {
                    postCssPlugins: [
                        require(`postcss-easy-import`)(),
                        require(`postcss-custom-properties`)({
                            preserve: false,
                        }),
                        require(`postcss-color-mod-function`)(),
                        require(`autoprefixer`)(),
                        require(`cssnano`)(),
                    ],
                },
            },
            `gatsby-plugin-styled-components`,
        ],
    }
}

// gatsby-config.js
module.exports = {
    plugins: [
        {
            resolve: `gatsby-theme-try-ghost`,
            options: {
                siteConfig: {
                    siteUrl: `https://kiranjoshi.net`,
                    postsPerPage: 3,
                    siteTitleMeta: `Kiran Joshi`,
                    siteDescriptionMeta: `Thoughts, content and ideas`,
                    shortTitle: `Ghost`,
                    siteIcon: `favicon.png`,
                    backgroundColor: `#e9e9e9`,
                    themeColor: `#15171A`,
                    gatsbyImages: true,
                    // Overwrite navigation menu (default: []), label is case sensitive
                    // overwriteGhostNavigation: [{ label: `Home`, url: `/` }],
                },
                ghostConfig: {
                    development: {
                        apiUrl: "https://kiranjoshi.herokuapp.com",
                        contentApiKey: "c359589ecd0d8589f190655cdd",
                    },
                    production: {
                        apiUrl: "https://kiranjoshi.herokuapp.com",
                        contentApiKey: "c359589ecd0d8589f190655cdd",
                    },
                },
                //routes: {
                //    // Root url for Ghost posts and pages (optional, defaults to `/`)
                //    basePath: `/blog`,
                //
                //    // Collections (optional , default: [])
                //    collections: [{
                //        path: `speeches`,
                //        selector: node => node.primary_tag && node.primary_tag.slug === `speeches`,
                //    }],
                //},
            },
        },
    ],
}

module.exports = {
  plugins: [
    {
      resolve: `gatsby-plugin-google-analytics`,
      options: {
        // The property ID; the tracking code won't be generated without it
        trackingId: "G-8Q6DBKSF3S",
        // Defines where to place the tracking script - `true` in the head and `false` in the body
        head: false,
        // Setting this parameter is optional
        anonymize: true,
        // Setting this parameter is also optional
        respectDNT: true,
        // Avoids sending pageview hits from custom paths
        exclude: ["/preview/**", "/do-not-track/me/too/"],
        // Delays sending pageview hits on route update (in milliseconds)
        pageTransitionDelay: 0,
        // Enables Google Optimize using your container Id
        optimizeId: "YOUR_GOOGLE_OPTIMIZE_TRACKING_ID",
        // Enables Google Optimize Experiment ID
        experimentId: "YOUR_GOOGLE_EXPERIMENT_ID",
        // Set Variation ID. 0 for original 1,2,3....
        variationId: "YOUR_GOOGLE_OPTIMIZE_VARIATION_ID",
        // Defers execution of google analytics script after page load
        defer: false,
        // Any additional optional fields
        sampleRate: 5,
        siteSpeedSampleRate: 10,
        cookieDomain: "example.com",
      },
    },
  ],
}

plugins: [
    {
        resolve: `gatsby-theme-ghost-dark-mode`,
        options: {
            // Set to true if you want your theme to default to dark mode (default: false)
            // Note that this setting has an effect only, if
            //    1. The user has not changed the dark mode
            //    2. Dark mode is not reported from OS
            defaultModeDark: true,
            // If you want the defaultModeDark setting to take precedence
            // over the mode reported from OS, set this to true (default: false)
            // Note that user choice still takes precedence over this setting
            overrideOS: true,
        },
    },
]
