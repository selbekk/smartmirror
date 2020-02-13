module Main exposing (..)

import Browser
import Html exposing (..)
import Html.Attributes exposing (..)
import Http
import Json.Decode as Decode
import Task
import Time


getApiPath : String -> String
getApiPath path =
    "http://localhost:8001/api" ++ path



-- MAIN


main : Program () Model Msg
main =
    Browser.element
        { init = init
        , update = update
        , view = view
        , subscriptions = subscriptions
        }



-- MODEL


type TransportationType
    = Bus
    | Tram


type alias Departure =
    { transportationType : TransportationType
    , lineNumber : Int
    , lineDescription : String
    , departureTime : Int
    }


type RemoteData dataType
    = Loading
    | Failed
    | Success dataType


type alias TimeData =
    { zone : Time.Zone
    , time : Time.Posix
    }


type alias Model =
    { departures : RemoteData (List Departure)
    , currentTime : TimeData
    }


init : () -> ( Model, Cmd Msg )
init _ =
    ( { departures = Loading, currentTime = TimeData Time.utc (Time.millisToPosix 0) }
    , Cmd.batch [ getDepartures, Task.perform TimeUpdated Time.now ]
    )



-- UPDATE


type Msg
    = DeparturesRequested
    | DeparturesReceived (Result Http.Error (List Departure))
    | TimeUpdated Time.Posix


update : Msg -> Model -> ( Model, Cmd Msg )
update msg model =
    case msg of
        DeparturesRequested ->
            ( { model | departures = Loading }, getDepartures )

        DeparturesReceived result ->
            case result of
                Ok departures ->
                    ( { model | departures = Success departures }, Cmd.none )

                Err _ ->
                    ( { model | departures = Failed }, Cmd.none )

        TimeUpdated newTime ->
            ( { model | currentTime = TimeData Time.utc newTime }, Cmd.none )



-- SUBSCRIPTIONS


subscriptions : Model -> Sub Msg
subscriptions _ =
    Time.every 1000 TimeUpdated



-- VIEW


getTimeUntilNow : TimeData -> Int -> String
getTimeUntilNow currentTime departureTime =
    let
        diffInMillis =
            departureTime - Time.posixToMillis currentTime.time

        minutesUntilDeparture =
            diffInMillis // 60000
    in
    if minutesUntilDeparture < 3 then
        "Går straks"

    else
        "Går om " ++ String.fromInt minutesUntilDeparture ++ " minutter"


viewDeparture : TimeData -> Departure -> Html Msg
viewDeparture timeData departure =
    li [ class "departure" ] [ text departure.lineDescription, br [] [], text (getTimeUntilNow timeData departure.departureTime) ]


viewDepartures : Model -> Html Msg
viewDepartures model =
    case model.departures of
        Loading ->
            div [ class "spinner" ] []

        Failed ->
            div [ class "error" ] [ text "Klarte ikke hente data!" ]

        Success departureList ->
            ul [ class "departures-list" ] (List.map (viewDeparture model.currentTime) departureList)


view : Model -> Html Msg
view model =
    Html.main_ [ class "root" ]
        [ section [ class "section section--top-left" ]
            [ h2 [ class "section__heading" ] [ text "Avganger" ]
            , viewDepartures model
            ]
        ]



-- HTTP


getDepartures : Cmd Msg
getDepartures =
    Http.get { url = getApiPath "/departures", expect = Http.expectJson DeparturesReceived departureListDecoder }


transportationTypeDecoder : Decode.Decoder TransportationType
transportationTypeDecoder =
    Decode.string
        |> Decode.andThen
            (\transportationType ->
                case transportationType of
                    "bus" ->
                        Decode.succeed Bus

                    "tram" ->
                        Decode.succeed Tram

                    _ ->
                        Decode.fail "Unknown transportation type"
            )


departureDecoder : Decode.Decoder Departure
departureDecoder =
    Decode.map4 Departure
        (Decode.field "transportationType" transportationTypeDecoder)
        (Decode.field "lineNumber" Decode.int)
        (Decode.field "lineDescription" Decode.string)
        (Decode.field "departureTime" Decode.int)


departureListDecoder : Decode.Decoder (List Departure)
departureListDecoder =
    Decode.list departureDecoder
